from __future__ import annotations

from dataclasses import dataclass
import numpy as np
import pandas as pd


@dataclass(frozen=True)
class RawTables:
    borrowers: pd.DataFrame
    accounts: pd.DataFrame
    inquiries: pd.DataFrame
    outcomes: pd.DataFrame


def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def generate_raw_tables(n_borrowers: int = 5000, seed: int = 20260926) -> RawTables:
    """Create reproducible synthetic, borrower-linked credit data.

    Grain:
      borrowers: one row per borrower
      accounts: one-to-many borrower -> accounts
      inquiries: zero-to-many borrower -> inquiries
      outcomes: one row per borrower, future 12m default indicator
    """
    rng = np.random.default_rng(seed)
    borrower_id = np.arange(1, n_borrowers + 1)
    segment = rng.choice(["corporate", "medium", "small"], n_borrowers, p=[0.18, 0.32, 0.50])
    annual_income = np.exp(rng.normal(11.0, 0.65, n_borrowers))
    leverage = np.clip(rng.beta(2.2, 3.4, n_borrowers) * 1.4, 0, 1.5)

    borrowers = pd.DataFrame({
        "borrower_id": borrower_id,
        "snapshot_date": pd.Timestamp("2025-12-31"),
        "segment": segment,
        "annual_income": annual_income,
        "leverage": leverage,
    })

    account_rows: list[dict] = []
    inquiry_rows: list[dict] = []
    account_id = 1
    inquiry_id = 1
    borrower_risk_components = np.zeros(n_borrowers)

    for i, bid in enumerate(borrower_id):
        n_accounts = int(rng.integers(1, 5))
        local_dpd = []
        local_util = []
        local_payment = []
        local_collateral = []
        local_exposure = []

        for _ in range(n_accounts):
            product = rng.choice(["term_loan", "overdraft", "card"], p=[0.48, 0.27, 0.25])
            limit_amount = float(np.exp(rng.normal(10.1, 0.75)))
            utilization = float(np.clip(rng.beta(2.0 + leverage[i] * 2.2, 2.8), 0.02, 1.15))
            balance = limit_amount * utilization
            dpd_draw = rng.random()
            if dpd_draw < 0.70:
                dpd = 0
            elif dpd_draw < 0.86:
                dpd = int(rng.integers(1, 30))
            elif dpd_draw < 0.96:
                dpd = int(rng.integers(30, 60))
            else:
                dpd = int(rng.integers(60, 90))
            payment_ratio = float(np.clip(rng.normal(0.96 - 0.0055 * dpd, 0.16), 0, 1.25))
            collateral_value = 0.0 if product == "card" else float(balance * rng.uniform(0.2, 1.6))

            account_rows.append({
                "account_id": account_id,
                "borrower_id": bid,
                "product": product,
                "balance": balance,
                "limit_amount": limit_amount,
                "days_past_due": dpd,
                "payment_ratio": payment_ratio,
                "collateral_value": collateral_value,
            })
            account_id += 1
            local_dpd.append(dpd)
            local_util.append(utilization)
            local_payment.append(payment_ratio)
            local_collateral.append(collateral_value)
            local_exposure.append(balance)

        n_inquiries = int(rng.poisson(1.2 + leverage[i] * 1.8))
        for _ in range(n_inquiries):
            days_back = int(rng.integers(1, 181))
            inquiry_rows.append({
                "inquiry_id": inquiry_id,
                "borrower_id": bid,
                "inquiry_date": pd.Timestamp("2025-12-31") - pd.Timedelta(days=days_back),
            })
            inquiry_id += 1

        exposure = max(sum(local_exposure), 1.0)
        collateral_cover = sum(local_collateral) / exposure
        borrower_risk_components[i] = (
            0.020 * max(local_dpd)
            + 1.25 * np.mean(local_util)
            - 1.35 * np.mean(local_payment)
            + 0.75 * leverage[i]
            + 0.11 * n_inquiries
            - 0.22 * np.clip(collateral_cover, 0, 2)
        )

    accounts = pd.DataFrame(account_rows)
    inquiries = pd.DataFrame(
        inquiry_rows,
        columns=["inquiry_id", "borrower_id", "inquiry_date"],
    )

    segment_effect = pd.Series(segment).map({"corporate": -0.30, "medium": 0.05, "small": 0.25}).to_numpy()
    macro_shift = 0.28
    latent_logit = -3.25 + borrower_risk_components + segment_effect + macro_shift
    true_pit_pd = np.clip(_sigmoid(latent_logit), 0.001, 0.85)
    default_12m = rng.binomial(1, true_pit_pd)

    outcomes = pd.DataFrame({
        "borrower_id": borrower_id,
        "outcome_window_start": pd.Timestamp("2026-01-01"),
        "outcome_window_end": pd.Timestamp("2026-12-31"),
        "default_12m": default_12m,
    })
    return RawTables(borrowers, accounts, inquiries, outcomes)


def build_borrower_features(raw: RawTables) -> pd.DataFrame:
    """Reduce all one-to-many sources to one row per borrower before joining."""
    if raw.borrowers["borrower_id"].duplicated().any():
        raise ValueError("borrowers must be unique at borrower_id")
    if raw.outcomes["borrower_id"].duplicated().any():
        raise ValueError("outcomes must be unique at borrower_id")

    account_agg = (
        raw.accounts.groupby("borrower_id", as_index=False)
        .agg(
            accounts_count=("account_id", "nunique"),
            exposure=("balance", "sum"),
            total_limit=("limit_amount", "sum"),
            max_dpd_12m=("days_past_due", "max"),
            late_accounts=("days_past_due", lambda s: int((s > 0).sum())),
            payment_ratio=("payment_ratio", "mean"),
            collateral_value=("collateral_value", "sum"),
        )
    )
    account_agg["utilization"] = account_agg["exposure"] / account_agg["total_limit"].clip(lower=1.0)
    account_agg["late_share"] = account_agg["late_accounts"] / account_agg["accounts_count"].clip(lower=1)
    account_agg["collateral_coverage"] = account_agg["collateral_value"] / account_agg["exposure"].clip(lower=1.0)

    inquiry_agg = (
        raw.inquiries.groupby("borrower_id", as_index=False)
        .size()
        .rename(columns={"size": "inquiries_6m"})
        if len(raw.inquiries)
        else pd.DataFrame(columns=["borrower_id", "inquiries_6m"])
    )

    features = (
        raw.borrowers
        .merge(account_agg, on="borrower_id", how="left", validate="one_to_one")
        .merge(inquiry_agg, on="borrower_id", how="left", validate="one_to_one")
    )
    features["inquiries_6m"] = features["inquiries_6m"].fillna(0).astype(int)

    if len(features) != len(raw.borrowers) or features["borrower_id"].duplicated().any():
        raise AssertionError("feature mart lost borrower grain")
    return features
