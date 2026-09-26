from __future__ import annotations

import numpy as np
import pandas as pd


def calibration_table(
    y_true: pd.Series,
    pd_hat: np.ndarray,
    bins: int = 10,
) -> pd.DataFrame:
    """Return equal-frequency probability buckets, highest risk first."""
    frame = pd.DataFrame(
        {
            "default_12m": y_true.to_numpy(),
            "pd": np.asarray(pd_hat),
        }
    )
    ranked = frame["pd"].rank(method="first", ascending=False)
    frame["risk_decile"] = pd.qcut(ranked, q=bins, labels=False) + 1
    return (
        frame.groupby("risk_decile", as_index=False)
        .agg(
            borrowers=("default_12m", "size"),
            events=("default_12m", "sum"),
            mean_pd=("pd", "mean"),
            observed_rate=("default_12m", "mean"),
        )
        .sort_values("risk_decile")
    )
