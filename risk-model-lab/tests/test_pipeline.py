import numpy as np

from risk_model_lab.data import generate_raw_tables, build_borrower_features
from risk_model_lab.metrics import psi
from risk_model_lab.pipeline import build_model_frame, split_frame, run
from risk_model_lab.pit import shift_pd_to_portfolio_target


def test_one_to_many_sources_are_reduced_to_borrower_grain():
    raw = generate_raw_tables(600, seed=11)
    assert len(raw.accounts) > len(raw.borrowers)
    features = build_borrower_features(raw)
    assert len(features) == len(raw.borrowers)
    assert not features["borrower_id"].duplicated().any()


def test_splits_are_borrower_disjoint():
    frame = build_model_frame(1000, seed=12)
    train, validation, test = split_frame(frame, seed=12)
    a, b, c = set(train.borrower_id), set(validation.borrower_id), set(test.borrower_id)
    assert not (a & b)
    assert not (a & c)
    assert not (b & c)
    assert len(a | b | c) == len(frame)


def test_pipeline_produces_bounded_holdout_metrics():
    result = run(1600, seed=13)
    metrics = result["test_metrics"]
    assert 0.5 <= metrics["auc"] <= 1.0
    assert 0.0 <= metrics["brier"] <= 1.0
    assert 0.0 <= metrics["ks"] <= 1.0
    assert result["rows"]["train"] + result["rows"]["validation"] + result["rows"]["test"] == result["rows"]["development_total"]


def test_pit_style_shift_hits_target_and_preserves_order():
    base = np.array([0.01, 0.03, 0.08, 0.15, 0.30])
    adjusted, shift = shift_pd_to_portfolio_target(base, 0.20)
    assert abs(adjusted.mean() - 0.20) < 1e-6
    assert shift > 0
    assert np.all(np.diff(adjusted) > 0)


def test_psi_is_zero_for_identical_distributions():
    x = np.linspace(0.01, 0.5, 500)
    assert abs(psi(x, x)) < 1e-12
