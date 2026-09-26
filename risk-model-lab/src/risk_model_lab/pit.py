from __future__ import annotations

import numpy as np


def _sigmoid(x: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-x))


def _logit(p: np.ndarray) -> np.ndarray:
    p = np.clip(np.asarray(p, dtype=float), 1e-6, 1 - 1e-6)
    return np.log(p / (1 - p))


def shift_pd_to_portfolio_target(pd_base: np.ndarray, target_mean_pd: float) -> tuple[np.ndarray, float]:
    """Apply one common log-odds intercept shift to match a portfolio mean PD.

    This is a transparent PIT-style teaching mechanism, not a regulatory calibration method.
    """
    if not 0 < target_mean_pd < 1:
        raise ValueError("target_mean_pd must be between 0 and 1")
    logits = _logit(pd_base)
    lo, hi = -12.0, 12.0
    for _ in range(100):
        mid = (lo + hi) / 2
        mean_pd = float(_sigmoid(logits + mid).mean())
        if mean_pd < target_mean_pd:
            lo = mid
        else:
            hi = mid
    shift = (lo + hi) / 2
    adjusted = _sigmoid(logits + shift)
    return adjusted, float(shift)
