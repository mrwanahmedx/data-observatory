from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

from .data import generate_raw_tables, build_borrower_features
from .metrics import model_metrics, psi
from .model import CalibratedModel, fit_baseline, fit_validation_calibrator, select_validation_threshold
from .pit import shift_pd_to_portfolio_target


def build_model_frame(n_borrowers: int = 5000, seed: int = 20260926) -> pd.DataFrame:
    raw = generate_raw_tables(n_borrowers=n_borrowers, seed=seed)
    features = build_borrower_features(raw)
    frame = features.merge(raw.outcomes[["borrower_id", "default_12m"]], on="borrower_id", validate="one_to_one")
    if frame["borrower_id"].duplicated().any():
        raise AssertionError("model frame must remain one row per borrower")
    return frame


def split_frame(frame: pd.DataFrame, seed: int = 20260926) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    train, temp = train_test_split(
        frame,
        test_size=0.40,
        stratify=frame["default_12m"],
        random_state=seed,
    )
    validation, test = train_test_split(
        temp,
        test_size=0.50,
        stratify=temp["default_12m"],
        random_state=seed + 1,
    )
    return train.copy(), validation.copy(), test.copy()


def run(n_borrowers: int = 5000, seed: int = 20260926) -> dict:
    frame = build_model_frame(n_borrowers, seed)
    train, validation, test = split_frame(frame, seed)

    baseline = fit_baseline(train, train["default_12m"].to_numpy())
    calibrator = fit_validation_calibrator(
        baseline,
        validation,
        validation["default_12m"].to_numpy(),
    )
    model = CalibratedModel(baseline, calibrator)

    validation_pd = model.predict_pd(validation)
    threshold = select_validation_threshold(validation["default_12m"].to_numpy(), validation_pd)

    # The held-out test sample is touched only after fitting and threshold selection are complete.
    train_pd = model.predict_pd(train)
    test_pd = model.predict_pd(test)
    metrics = model_metrics(test["default_12m"].to_numpy(), test_pd)
    metrics["score_psi_train_vs_test"] = psi(train_pd, test_pd)
    metrics["validation_selected_threshold"] = threshold

    test_mean = float(np.mean(test_pd))
    scenario_targets = {
        "upside": max(test_mean * 0.85, 0.001),
        "baseline": test_mean,
        "downside": min(test_mean * 1.25, 0.95),
    }
    scenarios = {}
    for name, target in scenario_targets.items():
        adjusted, shift = shift_pd_to_portfolio_target(test_pd, target)
        scenarios[name] = {
            "target_mean_pd": target,
            "actual_mean_pd": float(adjusted.mean()),
            "log_odds_shift": shift,
        }

    return {
        "project": "Synthetic Credit Risk Model Lab",
        "seed": seed,
        "grain": "one row per borrower at 2025-12-31",
        "rows": {
            "development_total": int(len(frame)),
            "train": int(len(train)),
            "validation": int(len(validation)),
            "test": int(len(test)),
        },
        "event_rates": {
            "train": float(train["default_12m"].mean()),
            "validation": float(validation["default_12m"].mean()),
            "test": float(test["default_12m"].mean()),
        },
        "test_metrics": metrics,
        "pit_style_scenarios": scenarios,
        "limitations": [
            "synthetic data",
            "random borrower-disjoint split rather than out-of-time validation",
            "illustrative PIT-style intercept shift, not regulatory calibration",
            "logistic baseline only",
        ],
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--borrowers", type=int, default=5000)
    parser.add_argument("--seed", type=int, default=20260926)
    parser.add_argument("--output", type=Path, default=Path("artifacts/run.json"))
    args = parser.parse_args()
    result = run(args.borrowers, args.seed)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print(json.dumps(result["test_metrics"], indent=2))


if __name__ == "__main__":
    main()
