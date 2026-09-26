from __future__ import annotations

import numpy as np
import pandas as pd


def population_stability_index(
    expected: pd.Series,
    actual: pd.Series,
    bins: int = 10,
    epsilon: float = 1e-6,
) -> float:
    """Compute PSI using development quantile cut points."""
    expected = pd.Series(expected).astype(float)
    actual = pd.Series(actual).astype(float)

    quantiles = np.unique(expected.quantile(np.linspace(0, 1, bins + 1)).to_numpy())
    if len(quantiles) < 3:
        return 0.0

    quantiles[0] = -np.inf
    quantiles[-1] = np.inf

    exp_bucket = pd.cut(expected, quantiles, include_lowest=True)
    act_bucket = pd.cut(actual, quantiles, include_lowest=True)

    exp_share = exp_bucket.value_counts(sort=False, normalize=True)
    act_share = act_bucket.value_counts(sort=False, normalize=True).reindex(
        exp_share.index, fill_value=0.0
    )

    exp_share = exp_share.clip(lower=epsilon)
    act_share = act_share.clip(lower=epsilon)

    psi = ((act_share - exp_share) * np.log(act_share / exp_share)).sum()
    return float(psi)
