from __future__ import annotations

import numpy as np
import pandas as pd


MODEL_FEATURES = [
    "age_years",
    "income_egp",
    "utilization",
    "debt_service_ratio",
    "max_dpd_12m",
    "inquiries_6m",
    "months_on_book",
    "segment",
]


def generate_portfolio(n: int = 6000, seed: int = 20260926) -> pd.DataFrame:
    """Generate deterministic synthetic borrower observations."""
    rng = np.random.default_rng(seed)

    observation_month = rng.integers(0, 24, size=n)
    observation_date = pd.Timestamp("2024-01-31") + pd.to_timedelta(
        observation_month * 30, unit="D"
    )

    segment = rng.choice(
        np.array(["retail", "micro", "sme"]),
        size=n,
        p=[0.58, 0.24, 0.18],
    )
    age_years = np.clip(rng.normal(38, 11, n), 21, 70)
    income_base = np.select(
        [segment == "retail", segment == "micro", segment == "sme"],
        [18000.0, 32000.0, 85000.0],
        default=20000.0,
    )
    income_egp = np.exp(rng.normal(np.log(income_base), 0.48))
    utilization = np.clip(rng.beta(2.1, 2.4, n), 0, 1)
    debt_service_ratio = np.clip(
        0.12 + 0.48 * utilization + rng.normal(0, 0.10, n), 0, 1
    )
    max_dpd_12m = rng.choice(
        np.array([0, 5, 15, 30, 60, 90]),
        size=n,
        p=[0.61, 0.12, 0.10, 0.08, 0.05, 0.04],
    )
    inquiries_6m = np.clip(rng.poisson(1.5 + 2.2 * utilization), 0, 12)
    months_on_book = rng.integers(6, 145, n)

    macro_stress = (observation_month / 23.0) * 0.45
    segment_effect = np.select(
        [segment == "retail", segment == "micro", segment == "sme"],
        [0.0, 0.18, -0.10],
        default=0.0,
    )

    origination_logit = (
        -3.55
        - 0.000004 * income_egp
        + 0.008 * (age_years - 38)
        + 0.55 * (segment == "micro").astype(float)
        - 0.20 * (segment == "sme").astype(float)
        + rng.normal(0, 0.18, n)
    )
    origination_pd = 1.0 / (1.0 + np.exp(-origination_logit))

    logit = (
        -4.15
        + 2.2 * utilization
        + 1.7 * debt_service_ratio
        + 0.018 * max_dpd_12m
        + 0.11 * inquiries_6m
        - 0.004 * months_on_book
        - 0.000006 * income_egp
        + segment_effect
        + macro_stress
        + rng.normal(0, 0.28, n)
    )
    pd_12m_true = 1.0 / (1.0 + np.exp(-logit))
    default_12m = rng.binomial(1, pd_12m_true)

    lgd = np.clip(
        0.58
        - 0.10 * (segment == "sme").astype(float)
        + 0.08 * utilization
        + rng.normal(0, 0.06, n),
        0.20,
        0.90,
    )
    ead = np.maximum(
        1000.0,
        income_egp * rng.uniform(1.0, 4.5, n) * (0.55 + utilization),
    )

    frame = pd.DataFrame(
        {
            "borrower_id": [f"B{i:06d}" for i in range(1, n + 1)],
            "observation_date": pd.to_datetime(observation_date),
            "age_years": age_years.round(1),
            "income_egp": income_egp.round(2),
            "utilization": utilization.round(6),
            "debt_service_ratio": debt_service_ratio.round(6),
            "max_dpd_12m": max_dpd_12m.astype(int),
            "inquiries_6m": inquiries_6m.astype(int),
            "months_on_book": months_on_book.astype(int),
            "segment": segment,
            "origination_pd": origination_pd.round(6),
            "pd_12m_true": pd_12m_true,
            "default_12m": default_12m.astype(int),
            "lgd": lgd.round(6),
            "ead": ead.round(2),
        }
    )
    return frame.sort_values(["observation_date", "borrower_id"]).reset_index(drop=True)


def time_split(
    frame: pd.DataFrame,
    cutoff: str | pd.Timestamp = "2025-06-30",
) -> tuple[pd.DataFrame, pd.DataFrame]:
    cutoff_ts = pd.Timestamp(cutoff)
    development = frame.loc[frame["observation_date"] <= cutoff_ts].copy()
    validation = frame.loc[frame["observation_date"] > cutoff_ts].copy()

    if development.empty or validation.empty:
        raise ValueError("Time split must produce non-empty development and validation sets.")
    if development["observation_date"].max() >= validation["observation_date"].min():
        raise AssertionError("Development and validation windows overlap.")

    return development, validation
