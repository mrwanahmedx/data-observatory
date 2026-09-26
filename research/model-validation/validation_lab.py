"""Independent validation utilities for synthetic credit-risk PD models."""
from __future__ import annotations

from dataclasses import dataclass, asdict
import json

import numpy as np
import pandas as pd
from scipy.stats import binomtest
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, brier_score_loss, roc_curve


@dataclass(frozen=True)
class ValidationThresholds:
    """Illustrative governance thresholds for the public demo."""
    minimum_auc: float = 0.65
    maximum_brier: float = 0.20
    maximum_psi: float = 0.25
    minimum_calibration_slope: float = 0.75
    maximum_calibration_slope: float = 1.25
    maximum_abs_calibration_intercept: float = 0.50
    minimum_events: int = 50


def generate_validation_data(
    n: int = 6000,
    seed: int = 20260926,
    model_quality: str = "good",
) -> pd.DataFrame:
    """Create fictional scores/outcomes with controllable model quality."""
    rng = np.random.default_rng(seed)
    utilization = np.clip(rng.beta(2.0, 3.0, n), 0, 1)
    debt_service = np.clip(rng.normal(0.34, 0.13, n), 0.03, 0.95)
    delinquency = rng.choice(
        [0, 1, 2, 3],
        n,
        p=[0.72, 0.14, 0.09, 0.05],
    )
    history = rng.integers(12, 180, n)

    true_logit = (
        -4.1
        + 2.5 * utilization
        + 1.5 * debt_service
        + 0.65 * delinquency
        - 0.003 * history
    )
    true_pd = 1 / (1 + np.exp(-true_logit))
    outcome = rng.binomial(1, true_pd)

    noise_scale = {
        "good": 0.35,
        "weak": 1.10,
        "poor": 2.10,
    }.get(model_quality)
    if noise_scale is None:
        raise ValueError("model_quality must be good, weak, or poor")

    model_logit = true_logit + rng.normal(0, noise_scale, n)
    predicted_pd = 1 / (1 + np.exp(-model_logit))

    if model_quality == "weak":
        predicted_pd = np.clip(predicted_pd * 1.25 + 0.01, 0.001, 0.95)
    elif model_quality == "poor":
        predicted_pd = np.clip(0.08 + 0.60 * predicted_pd, 0.001, 0.95)

    split = np.where(np.arange(n) % 5 == 0, "test", "development")
    return pd.DataFrame(
        {
            "borrower_id": [f"V{i:06d}" for i in range(n)],
            "split": split,
            "utilization": utilization,
            "debt_service_ratio": debt_service,
            "delinquency_band": delinquency,
            "history_months": history,
            "pd": predicted_pd,
            "bad": outcome,
        }
    )


def auc_gini(y: pd.Series, p: pd.Series) -> tuple[float, float]:
    if y.nunique() < 2:
        raise ValueError("AUC requires both outcome classes")
    auc = float(roc_auc_score(y, p))
    return auc, 2 * auc - 1


def ks_statistic(y: pd.Series, p: pd.Series) -> float:
    fpr, tpr, _ = roc_curve(y, p)
    return float(np.max(tpr - fpr))


def brier(y: pd.Series, p: pd.Series) -> float:
    return float(brier_score_loss(y, p))


def calibration_parameters(y: pd.Series, p: pd.Series) -> tuple[float, float]:
    """Estimate calibration intercept/slope using model log-odds as predictor."""
    clipped = np.clip(p.to_numpy(), 1e-6, 1 - 1e-6)
    log_odds = np.log(clipped / (1 - clipped)).reshape(-1, 1)
    model = LogisticRegression(C=1e6, solver="lbfgs")
    model.fit(log_odds, y.to_numpy())
    return float(model.intercept_[0]), float(model.coef_[0, 0])


def calibration_table(
    y: pd.Series,
    p: pd.Series,
    bins: int = 10,
) -> pd.DataFrame:
    frame = pd.DataFrame({"bad": y.to_numpy(), "pd": p.to_numpy()})
    frame["bin"] = pd.cut(
        frame["pd"],
        bins=np.linspace(0, 1, bins + 1),
        include_lowest=True,
        labels=False,
    )
    return (
        frame.groupby("bin", dropna=False)
        .agg(
            borrowers=("bad", "size"),
            events=("bad", "sum"),
            predicted_rate=("pd", "mean"),
            observed_rate=("bad", "mean"),
        )
        .reset_index()
    )


def psi(reference: pd.Series, sample: pd.Series, bins: int = 10) -> float:
    edges = np.quantile(reference, np.linspace(0, 1, bins + 1))
    edges[0], edges[-1] = -np.inf, np.inf
    edges = np.unique(edges)
    if len(edges) < 3:
        return 0.0

    ref_counts, _ = np.histogram(reference, bins=edges)
    sam_counts, _ = np.histogram(sample, bins=edges)
    ref_share = np.clip(ref_counts / max(ref_counts.sum(), 1), 1e-6, None)
    sam_share = np.clip(sam_counts / max(sam_counts.sum(), 1), 1e-6, None)
    return float(np.sum((sam_share - ref_share) * np.log(sam_share / ref_share)))



GRADE_LABELS = ("A", "B", "C", "D", "E")
GRADE_CUTOFFS = (0.02, 0.05, 0.10, 0.20)


def pd_grade(
    probabilities: pd.Series,
    cutoffs: tuple[float, ...] = GRADE_CUTOFFS,
) -> pd.Series:
    """Map PDs to transparent synthetic rating bands for migration analysis."""
    values = pd.Series(probabilities, copy=False).astype(float)
    if values.isna().any() or ((values < 0) | (values > 1)).any():
        raise ValueError("PD values must be complete and within [0, 1]")
    if tuple(sorted(cutoffs)) != tuple(cutoffs) or len(set(cutoffs)) != len(cutoffs):
        raise ValueError("Grade cutoffs must be unique and increasing")
    bins = [-np.inf, *cutoffs, np.inf]
    labels = GRADE_LABELS[: len(bins) - 1]
    return pd.Series(
        pd.cut(values, bins=bins, labels=labels, right=False, ordered=True),
        index=values.index,
        name="grade",
    )


def migration_matrix(
    prior_pd: pd.Series,
    current_pd: pd.Series,
) -> pd.DataFrame:
    """Return a count matrix from prior to current synthetic rating grade."""
    if len(prior_pd) != len(current_pd):
        raise ValueError("Prior and current populations must align")
    prior = pd_grade(pd.Series(prior_pd).reset_index(drop=True)).astype(str)
    current = pd_grade(pd.Series(current_pd).reset_index(drop=True)).astype(str)
    matrix = pd.crosstab(prior, current, dropna=False)
    matrix = matrix.reindex(index=GRADE_LABELS, columns=GRADE_LABELS, fill_value=0)
    matrix.index.name = "prior_grade"
    matrix.columns.name = "current_grade"
    return matrix.astype(int)


def audit_overrides(
    base: pd.DataFrame,
    overrides: pd.DataFrame,
) -> dict:
    """Audit synthetic expert overrides without defining an approval policy."""
    required_base = {"borrower_id", "pd"}
    required_override = {"borrower_id", "overridden_pd", "reason"}
    if missing := required_base.difference(base.columns):
        raise ValueError(f"Missing base columns: {sorted(missing)}")
    if missing := required_override.difference(overrides.columns):
        raise ValueError(f"Missing override columns: {sorted(missing)}")
    if base["borrower_id"].duplicated().any():
        raise ValueError("Base borrower grain must be unique")
    if overrides["borrower_id"].duplicated().any():
        raise ValueError("Each borrower can have at most one override record")
    if ((overrides["overridden_pd"] < 0) | (overrides["overridden_pd"] > 1)).any():
        raise ValueError("Overridden PD must be within [0, 1]")
    if overrides["reason"].fillna("").str.strip().eq("").any():
        raise ValueError("Every override requires a reason")

    joined = overrides.merge(
        base[["borrower_id", "pd"]],
        on="borrower_id",
        how="left",
        validate="one_to_one",
    )
    if joined["pd"].isna().any():
        raise ValueError("Override references borrower outside validation population")

    delta = joined["overridden_pd"] - joined["pd"]
    return {
        "overrides": int(len(joined)),
        "override_rate": float(len(joined) / len(base)) if len(base) else 0.0,
        "upward": int((delta > 0).sum()),
        "downward": int((delta < 0).sum()),
        "unchanged": int((delta == 0).sum()),
        "mean_abs_change": float(delta.abs().mean()) if len(joined) else 0.0,
        "max_abs_change": float(delta.abs().max()) if len(joined) else 0.0,
    }


def render_validation_report(result: dict) -> str:
    """Render a compact, deterministic Markdown validation summary."""
    metrics = result["metrics"]
    limitations = result.get("limitations", [])
    failures = result.get("failures", [])
    concerns = failures + limitations
    concern_text = "\n".join(f"- {item}" for item in concerns) or "- none"
    return (
        "# Synthetic Credit Risk Model Validation\n\n"
        f"**Verdict:** {result['verdict']}\n\n"
        "## Core metrics\n\n"
        f"- ROC AUC: {metrics['auc']:.4f}\n"
        f"- Gini: {metrics['gini']:.4f}\n"
        f"- KS: {metrics['ks']:.4f}\n"
        f"- Brier score: {metrics['brier']:.4f}\n"
        f"- PSI: {metrics['psi']:.4f}\n"
        f"- Calibration intercept: {metrics['calibration_intercept']:.4f}\n"
        f"- Calibration slope: {metrics['calibration_slope']:.4f}\n\n"
        "## Findings\n\n"
        f"{concern_text}\n\n"
        "_Synthetic/public portfolio exercise; not a production validation opinion._\n"
    )


def observed_expected_backtest(
    y: pd.Series,
    p: pd.Series,
) -> dict:
    observed = int(y.sum())
    expected = float(p.sum())
    average_pd = float(p.mean())
    test = binomtest(observed, n=len(y), p=average_pd, alternative="two-sided")
    return {
        "observed_events": observed,
        "expected_events": expected,
        "observed_rate": float(y.mean()),
        "predicted_rate": average_pd,
        "binomial_p_value": float(test.pvalue),
    }


def validate_model(
    development: pd.DataFrame,
    test: pd.DataFrame,
    thresholds: ValidationThresholds | None = None,
) -> dict:
    thresholds = thresholds or ValidationThresholds()
    y, p = test["bad"], test["pd"]
    auc, gini = auc_gini(y, p)
    intercept, slope = calibration_parameters(y, p)
    stability = psi(development["pd"], test["pd"])
    oe = observed_expected_backtest(y, p)

    metrics = {
        "auc": auc,
        "gini": gini,
        "ks": ks_statistic(y, p),
        "brier": brier(y, p),
        "calibration_intercept": intercept,
        "calibration_slope": slope,
        "psi": stability,
        "events": int(y.sum()),
        **oe,
    }

    failures = []
    limitations = []

    if metrics["events"] < thresholds.minimum_events:
        failures.append("insufficient events")
    if auc < thresholds.minimum_auc:
        failures.append("weak discrimination")
    if metrics["brier"] > thresholds.maximum_brier:
        limitations.append("high probability error")
    if stability > thresholds.maximum_psi:
        limitations.append("population instability")
    if not (
        thresholds.minimum_calibration_slope
        <= slope
        <= thresholds.maximum_calibration_slope
    ):
        limitations.append("calibration slope outside demo range")
    if abs(intercept) > thresholds.maximum_abs_calibration_intercept:
        limitations.append("calibration intercept outside demo range")
    if oe["binomial_p_value"] < 0.05:
        limitations.append("observed/expected backtest rejects calibration")

    if failures:
        verdict = "REDEVELOPMENT REQUIRED"
    elif limitations:
        verdict = "PASS WITH LIMITATIONS"
    else:
        verdict = "PASS"

    return {
        "metrics": metrics,
        "failures": failures,
        "limitations": limitations,
        "verdict": verdict,
    }


def compare_challenger(
    incumbent: pd.DataFrame,
    challenger: pd.DataFrame,
) -> dict:
    inc_auc, _ = auc_gini(incumbent["bad"], incumbent["pd"])
    ch_auc, _ = auc_gini(challenger["bad"], challenger["pd"])
    return {
        "incumbent_auc": inc_auc,
        "challenger_auc": ch_auc,
        "auc_difference": ch_auc - inc_auc,
        "challenger_better_auc": ch_auc > inc_auc,
    }


def demo() -> dict:
    data = generate_validation_data(model_quality="weak")
    development = data[data["split"] == "development"].copy()
    test = data[data["split"] == "test"].copy()
    result = validate_model(development, test)

    prior_pd = pd.Series(np.clip(test["pd"].to_numpy() * 0.90, 0.001, 0.999))
    migration = migration_matrix(prior_pd, test["pd"].reset_index(drop=True))
    override_rows = test[["borrower_id", "pd"]].head(8).copy()
    overrides = pd.DataFrame(
        {
            "borrower_id": override_rows["borrower_id"].to_numpy(),
            "overridden_pd": np.clip(
                override_rows["pd"].to_numpy() * 1.10,
                0.001,
                0.999,
            ),
            "reason": ["synthetic review example"] * len(override_rows),
        }
    )

    return {
        "thresholds": asdict(ValidationThresholds()),
        **result,
        "migration_matrix": migration.to_dict(),
        "override_audit": audit_overrides(test[["borrower_id", "pd"]], overrides),
        "markdown_report": render_validation_report(result),
    }


if __name__ == "__main__":
    print(json.dumps(demo(), indent=2))
