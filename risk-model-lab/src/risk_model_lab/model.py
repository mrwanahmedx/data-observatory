from __future__ import annotations

from dataclasses import dataclass
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


NUMERIC_FEATURES = [
    "annual_income",
    "leverage",
    "accounts_count",
    "exposure",
    "utilization",
    "max_dpd_12m",
    "late_share",
    "payment_ratio",
    "collateral_coverage",
    "inquiries_6m",
]
CATEGORICAL_FEATURES = ["segment"]
FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


@dataclass
class CalibratedModel:
    baseline: Pipeline
    calibrator: LogisticRegression

    def predict_raw(self, frame: pd.DataFrame) -> np.ndarray:
        return self.baseline.predict_proba(frame[FEATURES])[:, 1]

    def predict_pd(self, frame: pd.DataFrame) -> np.ndarray:
        raw = np.clip(self.predict_raw(frame), 1e-6, 1 - 1e-6)
        raw_logit = np.log(raw / (1 - raw)).reshape(-1, 1)
        return self.calibrator.predict_proba(raw_logit)[:, 1]


def fit_baseline(train: pd.DataFrame, y_train: np.ndarray) -> Pipeline:
    transformer = ColumnTransformer([
        ("num", StandardScaler(), NUMERIC_FEATURES),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
    ])
    model = LogisticRegression(max_iter=1000, C=1.0, solver="lbfgs")
    pipeline = Pipeline([("prep", transformer), ("model", model)])
    pipeline.fit(train[FEATURES], y_train)
    return pipeline


def fit_validation_calibrator(
    baseline: Pipeline,
    validation: pd.DataFrame,
    y_validation: np.ndarray,
) -> LogisticRegression:
    raw = np.clip(baseline.predict_proba(validation[FEATURES])[:, 1], 1e-6, 1 - 1e-6)
    raw_logit = np.log(raw / (1 - raw)).reshape(-1, 1)
    calibrator = LogisticRegression(C=1e6, solver="lbfgs")
    calibrator.fit(raw_logit, y_validation)
    return calibrator


def select_validation_threshold(y_true: np.ndarray, pd_hat: np.ndarray) -> float:
    """Select a demonstration threshold using validation-set Youden J only."""
    candidates = np.linspace(0.02, 0.80, 200)
    best_t, best_j = 0.5, -np.inf
    for threshold in candidates:
        pred = pd_hat >= threshold
        positives = y_true == 1
        negatives = ~positives
        tpr = float((pred & positives).sum() / max(positives.sum(), 1))
        fpr = float((pred & negatives).sum() / max(negatives.sum(), 1))
        score = tpr - fpr
        if score > best_j:
            best_t, best_j = float(threshold), score
    return best_t
