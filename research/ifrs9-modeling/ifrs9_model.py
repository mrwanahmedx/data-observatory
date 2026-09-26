"""Clean-room synthetic IFRS 9 expected-credit-loss demonstration."""
from __future__ import annotations

from dataclasses import dataclass
import json

import numpy as np
import pandas as pd


@dataclass(frozen=True)
class StageConfig:
    """Illustrative public-demo triggers, not bank policy."""
    stage2_dpd: int = 30
    stage3_dpd: int = 90
    sicr_pd_ratio: float = 2.0


@dataclass(frozen=True)
class Scenario:
    name: str
    weight: float
    pd_multiplier: float
    lgd_addon: float


DEFAULT_SCENARIOS = (
    Scenario("baseline", 0.60, 1.00, 0.00),
    Scenario("downside", 0.25, 1.35, 0.08),
    Scenario("upside", 0.15, 0.80, -0.04),
)


def generate_portfolio(n: int = 5000, seed: int = 20260926) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    balance = rng.lognormal(10.1, 0.75, n)
    undrawn = rng.lognormal(8.4, 0.9, n)
    utilization = balance / (balance + undrawn)
    collateral = np.clip(rng.beta(2.2, 2.8, n), 0, 1.4)
    debt_service = np.clip(rng.normal(0.33, 0.12, n), 0.05, 0.90)
    dpd = rng.choice(
        [0, 5, 15, 30, 60, 90, 120],
        n,
        p=[0.67, 0.08, 0.07, 0.07, 0.05, 0.04, 0.02],
    )
    latent = (
        -4.6
        + 2.0 * utilization
        + 1.3 * debt_service
        + 0.018 * dpd
        - np.minimum(collateral, 1.0)
    )
    origination_pd = np.clip(1 / (1 + np.exp(-latent)), 0.002, 0.35)
    deterioration = 1 + 0.012 * dpd + rng.normal(0, 0.12, n)
    current_pd = np.clip(origination_pd * deterioration, 0.002, 0.75)
    impaired = (dpd >= 90) | ((current_pd > 0.45) & (rng.random(n) < 0.25))

    return pd.DataFrame(
        {
            "borrower_id": [f"B{i:06d}" for i in range(n)],
            "exposure_id": [f"E{i:06d}" for i in range(n)],
            "balance": balance,
            "undrawn": undrawn,
            "utilization": utilization,
            "collateral_coverage": collateral,
            "debt_service_ratio": debt_service,
            "dpd": dpd,
            "origination_pd": origination_pd,
            "current_pd": current_pd,
            "remaining_years": rng.integers(1, 8, n),
            "eir": rng.uniform(0.08, 0.18, n),
            "credit_impaired": impaired.astype(int),
        }
    )


def validate_inputs(df: pd.DataFrame) -> None:
    required = {
        "exposure_id", "balance", "undrawn", "utilization",
        "collateral_coverage", "dpd", "origination_pd", "current_pd",
        "remaining_years", "eir", "credit_impaired",
    }
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"Missing required columns: {sorted(missing)}")
    if df["exposure_id"].duplicated().any():
        raise ValueError("Exposure grain is not unique")
    if (df[["balance", "undrawn", "dpd", "current_pd"]] < 0).any().any():
        raise ValueError("Negative risk inputs detected")
    if (df["origination_pd"] <= 0).any():
        raise ValueError("origination_pd must be positive")


def assign_stage(df: pd.DataFrame, config: StageConfig | None = None) -> pd.Series:
    config = config or StageConfig()
    validate_inputs(df)
    pd_ratio = df["current_pd"] / df["origination_pd"]
    stage3 = (df["credit_impaired"] == 1) | (df["dpd"] >= config.stage3_dpd)
    stage2 = (
        (df["dpd"] >= config.stage2_dpd)
        | (pd_ratio >= config.sicr_pd_ratio)
    ) & ~stage3
    return pd.Series(
        np.select([stage3, stage2], [3, 2], default=1),
        index=df.index,
        name="stage",
    )


def estimate_ead(df: pd.DataFrame) -> pd.Series:
    ccf = np.clip(0.35 + 0.40 * df["utilization"], 0.35, 0.75)
    return pd.Series(df["balance"] + ccf * df["undrawn"], index=df.index, name="ead")


def estimate_lgd(df: pd.DataFrame) -> pd.Series:
    lgd = (
        0.58
        - 0.38 * np.minimum(df["collateral_coverage"], 1.0)
        + 0.06 * (df["dpd"] >= 60).astype(float)
    )
    return pd.Series(np.clip(lgd, 0.10, 0.90), index=df.index, name="lgd")


def lifetime_pd(pd_12m: pd.Series, years: pd.Series) -> pd.Series:
    values = 1 - np.power(1 - np.clip(pd_12m, 0, 0.999), years)
    return pd.Series(np.clip(values, 0, 1), index=pd_12m.index)


def scenario_ecl(df: pd.DataFrame, scenario: Scenario) -> pd.Series:
    ead = estimate_ead(df)
    lgd = np.clip(estimate_lgd(df) + scenario.lgd_addon, 0.05, 0.95)
    pd_12m = pd.Series(
        np.clip(df["current_pd"] * scenario.pd_multiplier, 0, 1),
        index=df.index,
    )
    pd_life = lifetime_pd(pd_12m, df["remaining_years"])
    selected_pd = np.where(
        df["stage"] == 1,
        pd_12m,
        np.where(df["stage"] == 2, pd_life, 1.0),
    )
    horizon = np.where(df["stage"] == 1, 1, df["remaining_years"])
    discount = 1 / np.power(1 + df["eir"], horizon)
    return pd.Series(
        np.asarray(selected_pd) * np.asarray(lgd) * np.asarray(ead) * discount,
        index=df.index,
        name=f"ecl_{scenario.name}",
    )


def calculate_ecl(
    df: pd.DataFrame,
    scenarios: tuple[Scenario, ...] = DEFAULT_SCENARIOS,
) -> pd.DataFrame:
    if not np.isclose(sum(s.weight for s in scenarios), 1.0):
        raise ValueError("Scenario weights must sum to 1")

    out = df.copy()
    out["stage"] = assign_stage(out)
    weighted = np.zeros(len(out))
    for scenario in scenarios:
        values = scenario_ecl(out, scenario)
        out[values.name] = values
        weighted += scenario.weight * values.to_numpy()
    out["ead"] = estimate_ead(out)
    out["lgd"] = estimate_lgd(out)
    out["ecl"] = weighted
    return out


def portfolio_summary(df: pd.DataFrame) -> dict:
    grouped = (
        df.groupby("stage")
        .agg(exposures=("exposure_id", "count"), balance=("balance", "sum"), ecl=("ecl", "sum"))
        .round(2)
    )
    return {
        "rows": int(len(df)),
        "total_balance": round(float(df["balance"].sum()), 2),
        "total_ecl": round(float(df["ecl"].sum()), 2),
        "stages": grouped.to_dict(orient="index"),
    }


def main() -> None:
    result = calculate_ecl(generate_portfolio())
    print(json.dumps(portfolio_summary(result), indent=2))


if __name__ == "__main__":
    main()
