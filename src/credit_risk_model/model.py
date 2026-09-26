from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import brier_score_loss, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from .data import MODEL_FEATURES


NUMERIC_FEATURES = [x for x in MODEL_FEATURES if x != "segment"]
CATEGORICAL_FEATURES = ["segment"]


@dataclass(frozen=True)
class ValidationMetrics:
    auc: float
    brier: float
    ks: float
    event_rate: float
    mean_pd: float


def build_model() -> Pipeline:
    preprocess = ColumnTransformer(
        [
            ("num", StandardScaler(), NUMERIC_FEATURES),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore"),
                CATEGORICAL_FEATURES,
            ),
        ]
    )
    return Pipeline(
        [
            ("preprocess", preprocess),
            (
                "model",
                LogisticRegression(
                    max_iter=1000,
                    solver="lbfgs",
                    random_state=20260926,
                ),
            ),
        ]
    )


def fit_model(development: pd.DataFrame) -> Pipeline:
    model = build_model()
    model.fit(development[MODEL_FEATURES], development["default_12m"])
    return model


def score(model: Pipeline, frame: pd.DataFrame) -> np.ndarray:
    probabilities = model.predict_proba(frame[MODEL_FEATURES])[:, 1]
    if np.any((probabilities < 0) | (probabilities > 1)):
        raise AssertionError("Predicted probabilities must lie in [0, 1].")
    return probabilities


def ks_statistic(y_true: pd.Series | np.ndarray, pd_hat: np.ndarray) -> float:
    table = pd.DataFrame({"y": np.asarray(y_true), "pd": np.asarray(pd_hat)})
    table = table.sort_values("pd", ascending=False)
    events = table["y"].sum()
    non_events = len(table) - events
    if events == 0 or non_events == 0:
        return float("nan")
    cum_event = table["y"].cumsum() / events
    cum_non_event = (1 - table["y"]).cumsum() / non_events
    return float((cum_event - cum_non_event).abs().max())


def validate(model: Pipeline, validation: pd.DataFrame) -> ValidationMetrics:
    pd_hat = score(model, validation)
    y = validation["default_12m"]
    return ValidationMetrics(
        auc=float(roc_auc_score(y, pd_hat)),
        brier=float(brier_score_loss(y, pd_hat)),
        ks=ks_statistic(y, pd_hat),
        event_rate=float(y.mean()),
        mean_pd=float(pd_hat.mean()),
    )
