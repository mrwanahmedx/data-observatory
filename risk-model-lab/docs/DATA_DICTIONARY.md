# Data Dictionary

## borrowers — one row per borrower

| Column | Meaning |
| --- | --- |
| borrower_id | synthetic borrower key |
| snapshot_date | observation date, fixed at 2025-12-31 |
| segment | synthetic portfolio segment |
| annual_income | generated annual income proxy |
| leverage | generated leverage proxy |

## accounts — one row per account

| Column | Meaning |
| --- | --- |
| account_id | synthetic account key |
| borrower_id | borrower foreign key |
| product | term loan / overdraft / card |
| balance | synthetic outstanding balance |
| limit_amount | synthetic facility/account limit |
| days_past_due | point-in-time DPD proxy |
| payment_ratio | synthetic repayment ratio |
| collateral_value | synthetic collateral value |

## inquiries — one row per inquiry

| Column | Meaning |
| --- | --- |
| inquiry_id | inquiry key |
| borrower_id | borrower foreign key |
| inquiry_date | inquiry date inside the historical window |

## outcomes — one row per borrower

| Column | Meaning |
| --- | --- |
| borrower_id | borrower key |
| outcome_window_start | future outcome window start |
| outcome_window_end | future outcome window end |
| default_12m | synthetic future default indicator |

## borrower feature mart — one row per borrower

The mart keeps borrower-level fields and adds:

- accounts_count
- exposure
- total_limit
- max_dpd_12m
- late_accounts
- payment_ratio
- collateral_value
- utilization
- late_share
- collateral_coverage
- inquiries_6m

### Grain rule

No one-to-many detail table may enter the model mart directly. Every child source must first be reduced to one row per borrower. The code uses `validate="one_to_one"` on joins and a final duplicate assertion.
