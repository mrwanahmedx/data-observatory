from __future__ import annotations

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score, brier_score_loss, roc_curve


def ks_statistic(y_true: np.ndarray, pd_hat: np.ndarray) -> float:
    fpr, tpr, _ = roc_curve(y_true, pd_hat)
    return float(np.max(tpr - fpr))


def calibration_intercept_slope(y_true: np.ndarray, pd_hat: np.ndarray) -> tuple[float, float]:
    eps = 1e-6
    p = np.clip(pd_hat, eps, 1 - eps)
    logit = np.log(p / (1 - p)).reshape(-1, 1)
    model = LogisticRegression(C=1e6, solver="lbfgs")
    model.fit(logit, y_true)
    return float(model.intercept_[0]), float(model.coef_[0, 0])


def psi(expected: np.ndarray, actual: np.ndarray, bins: int = 10) -> float:
    expected = np.asarray(expected, dtype=float)
    actual = np.asarray(actual, dtype=float)
    cuts = np.unique(np.quantile(expected, np.linspace(0, 1, bins + 1)))
    if len(cuts) < 3:
        # A constant reference is not proof of stability: retain a PD-wide fallback.
        cuts = np.linspace(0.0, 1.0, bins + 1)
    cuts[0], cuts[-1] = -np.inf, np.inf
    e = np.histogram(expected, bins=cuts)[0] / max(len(expected), 1)
    a = np.histogram(actual, bins=cuts)[0] / max(len(actual), 1)
    e = np.clip(e, 1e-6, None)
    a = np.clip(a, 1e-6, None)
    return float(np.sum((a - e) * np.log(a / e)))


def model_metrics(y_true: np.ndarray, pd_hat: np.ndarray) -> dict[str, float]:
    auc = float(roc_auc_score(y_true, pd_hat))
    intercept, slope = calibration_intercept_slope(y_true, pd_hat)
    return {
        "auc": auc,
        "gini": 2 * auc - 1,
        "brier": float(brier_score_loss(y_true, pd_hat)),
        "ks": ks_statistic(y_true, pd_hat),
        "calibration_intercept": intercept,
        "calibration_slope": slope,
        "mean_pd": float(np.mean(pd_hat)),
        "observed_default_rate": float(np.mean(y_true)),
    }
