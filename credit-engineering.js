const round=(v,d=4)=>Number.isFinite(v)?Number(v.toFixed(d)):null;
const sum=(rows,key)=>rows.reduce((total,row)=>total+(Number(row[key])||0),0);

export function engineeringQueries(){
  return {
    "01_grain_control_and_dedup": `/*
Portfolio SQL pattern — synthetic schema only.
Goal: force a deterministic one-row-per-borrower scope BEFORE any feature joins.
This mirrors the grain-control discipline used in production analytics pipelines.
*/

DECLARE @ObservationDate date = '2025-12-31';

WITH borrower_ranked AS (
    SELECT
        b.borrower_id,
        b.product_group,
        b.updated_at,
        b.source_row_id,
        ROW_NUMBER() OVER (
            PARTITION BY b.borrower_id
            ORDER BY b.updated_at DESC, b.source_row_id DESC
        ) AS rn,
        COUNT(*) OVER (PARTITION BY b.borrower_id) AS source_rows
    FROM dbo.borrower_master AS b
    WHERE b.effective_date <= @ObservationDate
),
borrower_scope AS (
    SELECT
        borrower_id,
        product_group,
        source_rows
    FROM borrower_ranked
    WHERE rn = 1
),
duplicate_diagnostic AS (
    SELECT
        borrower_id,
        MAX(source_rows) AS source_rows
    FROM borrower_scope
    GROUP BY borrower_id
    HAVING MAX(source_rows) > 1
)
SELECT
    COUNT(*) AS final_rows,
    COUNT(DISTINCT borrower_id) AS distinct_borrowers,
    SUM(CASE WHEN source_rows > 1 THEN 1 ELSE 0 END) AS borrowers_deduplicated
FROM borrower_scope;

-- Must return zero rows before downstream joins.
SELECT borrower_id, source_rows
FROM duplicate_diagnostic
ORDER BY source_rows DESC, borrower_id;`,

    "02_preaggregate_before_join": `/*
Fan-out prevention pattern.
Never join borrower scope directly to account-month or inquiry detail.
Aggregate every one-to-many source to borrower grain first, then join.
*/

DECLARE @ObservationDate date = '2025-12-31';

WITH latest_account_month AS (
    SELECT
        m.borrower_id,
        m.account_id,
        m.balance,
        m.limit_amount,
        m.days_past_due,
        ROW_NUMBER() OVER (
            PARTITION BY m.borrower_id, m.account_id
            ORDER BY m.month_end DESC, m.snapshot_id DESC
        ) AS rn
    FROM dbo.account_monthly AS m
    WHERE m.month_end <= @ObservationDate
),
account_snapshot AS (
    SELECT
        borrower_id,
        account_id,
        balance,
        limit_amount,
        days_past_due
    FROM latest_account_month
    WHERE rn = 1
),
account_agg AS (
    SELECT
        borrower_id,
        COUNT(DISTINCT account_id) AS account_count,
        SUM(COALESCE(balance, 0.0)) AS exposure,
        SUM(COALESCE(limit_amount, 0.0)) AS total_limit,
        MAX(COALESCE(days_past_due, 0)) AS max_dpd,
        CAST(
            SUM(COALESCE(balance, 0.0))
            / NULLIF(SUM(COALESCE(limit_amount, 0.0)), 0.0)
            AS decimal(18,6)
        ) AS utilization
    FROM account_snapshot
    GROUP BY borrower_id
),
inquiry_agg AS (
    SELECT
        i.borrower_id,
        SUM(CASE WHEN i.inquiry_date > DATEADD(day, -90, @ObservationDate)
                 THEN 1 ELSE 0 END) AS inquiries_90d
    FROM dbo.credit_inquiry AS i
    WHERE i.inquiry_date <= @ObservationDate
    GROUP BY i.borrower_id
)
SELECT
    s.borrower_id,
    s.product_group,
    COALESCE(a.account_count, 0) AS account_count,
    COALESCE(a.exposure, 0.0) AS exposure,
    COALESCE(a.total_limit, 0.0) AS total_limit,
    COALESCE(a.max_dpd, 0) AS max_dpd,
    COALESCE(a.utilization, 0.0) AS utilization,
    COALESCE(q.inquiries_90d, 0) AS inquiries_90d
FROM dbo.borrower_scope AS s
LEFT JOIN account_agg AS a
    ON a.borrower_id = s.borrower_id
LEFT JOIN inquiry_agg AS q
    ON q.borrower_id = s.borrower_id;`,

    "03_fanout_safe_feature_join": `/*
Feature assembly with explicit grain contracts.
Each CTE must expose exactly one row per borrower before entering final_features.
The duplicate check at the end is a release gate, not a debugging afterthought.
*/

WITH repayment_agg AS (
    SELECT
        p.borrower_id,
        AVG(CAST(p.payment_ratio AS decimal(18,6))) AS avg_payment_ratio,
        SUM(CASE WHEN p.days_past_due >= 30 THEN 1 ELSE 0 END) AS dpd30_months,
        MAX(p.days_past_due) AS max_dpd_12m
    FROM dbo.repayment_history AS p
    WHERE p.month_end BETWEEN '2025-01-31' AND '2025-12-31'
    GROUP BY p.borrower_id
),
balance_agg AS (
    SELECT
        m.borrower_id,
        AVG(CAST(m.balance AS decimal(18,2))) AS avg_balance_12m,
        MAX(CAST(m.balance AS decimal(18,2))) AS peak_balance_12m,
        COUNT(DISTINCT m.account_id) AS distinct_accounts
    FROM dbo.account_monthly AS m
    WHERE m.month_end BETWEEN '2025-01-31' AND '2025-12-31'
    GROUP BY m.borrower_id
),
feature_join AS (
    SELECT
        s.borrower_id,
        s.product_group,
        COALESCE(r.avg_payment_ratio, 0.0) AS avg_payment_ratio,
        COALESCE(r.dpd30_months, 0) AS dpd30_months,
        COALESCE(r.max_dpd_12m, 0) AS max_dpd_12m,
        COALESCE(b.avg_balance_12m, 0.0) AS avg_balance_12m,
        COALESCE(b.peak_balance_12m, 0.0) AS peak_balance_12m,
        COALESCE(b.distinct_accounts, 0) AS distinct_accounts
    FROM dbo.borrower_scope AS s
    LEFT JOIN repayment_agg AS r
        ON r.borrower_id = s.borrower_id
    LEFT JOIN balance_agg AS b
        ON b.borrower_id = s.borrower_id
)
SELECT *
FROM feature_join;

-- Release gate: this MUST return no borrower.
SELECT borrower_id, COUNT(*) AS rows_after_join
FROM feature_join
GROUP BY borrower_id
HAVING COUNT(*) <> 1;`,

    "04_reconciliation_and_quality_checks": `/*
Final reconciliation pack.
Checks row conservation, duplicate keys, null model inputs and exposure movement.
A pipeline is not complete until these controls reconcile.
*/

WITH final_population AS (
    SELECT
        f.borrower_id,
        f.product_group,
        f.split,
        f.exposure,
        f.pd,
        f.bad_6m
    FROM dbo.model_features AS f
),
grain_check AS (
    SELECT
        borrower_id,
        COUNT(*) AS row_count
    FROM final_population
    GROUP BY borrower_id
),
quality AS (
    SELECT
        COUNT(*) AS final_rows,
        COUNT(DISTINCT borrower_id) AS distinct_borrowers,
        SUM(CASE WHEN pd IS NULL THEN 1 ELSE 0 END) AS null_pd_rows,
        SUM(CASE WHEN exposure IS NULL THEN 1 ELSE 0 END) AS null_exposure_rows,
        SUM(CASE WHEN exposure < 0 THEN 1 ELSE 0 END) AS negative_exposure_rows,
        SUM(exposure) AS total_exposure
    FROM final_population
)
SELECT
    q.*,
    q.final_rows - q.distinct_borrowers AS duplicate_rows
FROM quality AS q;

SELECT
    split,
    COUNT(*) AS rows_in_split,
    COUNT(DISTINCT borrower_id) AS distinct_borrowers,
    SUM(exposure) AS exposure,
    AVG(CAST(bad_6m AS decimal(18,6))) AS event_rate
FROM final_population
GROUP BY split
ORDER BY split;

-- Hard stop if this returns anything.
SELECT borrower_id, row_count
FROM grain_check
WHERE row_count <> 1;`
  };
}

export function engineeringReports(data){
  const rows=Array.isArray(data?.rows)?data.rows:[];
  const distinctBorrowers=new Set(rows.map(r=>r.borrower_id)).size;
  const nullPd=rows.filter(r=>r.pd==null||!Number.isFinite(Number(r.pd))).length;
  const nullExposure=rows.filter(r=>r.exposure==null||!Number.isFinite(Number(r.exposure))).length;

  const productGroups=[...new Set(rows.map(r=>r.product_group))].sort();
  const preaggregate=productGroups.map(product_group=>{
    const part=rows.filter(r=>r.product_group===product_group);
    return {
      product_group,
      borrowers:part.length,
      distinct_borrowers:new Set(part.map(r=>r.borrower_id)).size,
      exposure_egp:round(sum(part,'exposure'),2),
      mean_probability:round(part.length?sum(part,'pd')/part.length:0,6),
      observed_event_rate:round(part.length?sum(part,'bad_6m')/part.length:0,6)
    };
  });

  const featurePreview=rows.slice(0,20).map(r=>({
    borrower_id:r.borrower_id,
    product_group:r.product_group,
    history_months:r.history_months,
    exposure_egp:round(Number(r.exposure)||0,2),
    predicted_probability:round(Number(r.pd)||0,6),
    bad_6m:r.bad_6m
  }));

  const splits=[...new Set(rows.map(r=>r.split))].sort();
  const reconciliation=splits.map(split=>{
    const part=rows.filter(r=>r.split===split);
    const distinct=new Set(part.map(r=>r.borrower_id)).size;
    return {
      split,
      row_count:part.length,
      distinct_borrowers:distinct,
      duplicate_rows:part.length-distinct,
      exposure_egp:round(sum(part,'exposure'),2),
      event_rate:round(part.length?sum(part,'bad_6m')/part.length:0,6)
    };
  });

  return {
    "01_grain_control_and_dedup":[{
      published_rows:rows.length,
      distinct_borrowers:distinctBorrowers,
      duplicate_rows:rows.length-distinctBorrowers,
      null_probability_rows:nullPd,
      null_exposure_rows:nullExposure
    }],
    "02_preaggregate_before_join":preaggregate,
    "03_fanout_safe_feature_join":featurePreview,
    "04_reconciliation_and_quality_checks":reconciliation
  };
}
