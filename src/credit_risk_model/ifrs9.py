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
    current_pd = pd.Series(current_pd, dtype=float)
    origination_pd = pd.Series(origination_pd, dtype=float).clip(lower=1e-6)
    dpd = pd.Series(dpd, dtype=float)
    if default_flag is None:
        default_flag = pd.Series(False, index=current_pd.index)
    else:
        default_flag = pd.Series(default_flag, index=current_pd.index).astype(bool)

    stage3 = default_flag | (dpd >= 90)
    relative_deterioration = current_pd / origination_pd >= sicr_ratio
    stage2 = (~stage3) & ((dpd >= 30) | relative_deterioration)

    stage = np.select([stage3, stage2], [3, 2], default=1)
    return pd.Series(stage, index=current_pd.index, name="stage", dtype=int)


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
