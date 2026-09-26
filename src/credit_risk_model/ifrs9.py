from __future__ import annotations

import numpy as np
import pandas as pd


def assign_stage(
    current_pd: pd.Series,
    origination_pd: pd.Series,
    dpd: pd.Series,
    default_flag: pd.Series | None = None,
    sicr_ratio: float = 2.0,
) -> pd.Series:
    """Illustrative IFRS 9-style staging, not a regulatory implementation."""
    output_index = (
        current_pd.index
        if isinstance(current_pd, pd.Series)
        else pd.RangeIndex(len(np.asarray(current_pd)))
    )
    current = np.asarray(current_pd, dtype=float)
    origination = np.clip(np.asarray(origination_pd, dtype=float), 1e-6, None)
    dpd_values = np.asarray(dpd, dtype=float)
    defaults = (
        np.zeros(len(current), dtype=bool)
        if default_flag is None
        else np.asarray(default_flag, dtype=bool)
    )

    lengths = {len(current), len(origination), len(dpd_values), len(defaults)}
    if len(lengths) != 1:
        raise ValueError("Staging inputs must have equal length.")

    stage3 = defaults | (dpd_values >= 90)
    relative_deterioration = current / origination >= sicr_ratio
    stage2 = (~stage3) & ((dpd_values >= 30) | relative_deterioration)

    stage = np.select([stage3, stage2], [3, 2], default=1)
    return pd.Series(stage, index=output_index, name="stage", dtype=int)


def simplified_ecl(
    pd_horizon: pd.Series,
    lgd: pd.Series,
    ead: pd.Series,
    discount_factor: float = 1.0,
) -> pd.Series:
    """Simplified educational ECL = PD × LGD × EAD × discount factor."""
    pd_horizon = pd.Series(pd_horizon, dtype=float).clip(0, 1)
    lgd = pd.Series(lgd, dtype=float).clip(0, 1)
    ead = pd.Series(ead, dtype=float).clip(lower=0)
    if not 0 < discount_factor <= 1:
        raise ValueError("discount_factor must be in (0, 1].")
    ecl = pd_horizon * lgd * ead * discount_factor
    return pd.Series(ecl, index=ead.index, name="ecl")
