import numpy as np

from credit_risk_model.data import MODEL_FEATURES, generate_portfolio, time_split
from credit_risk_model.ifrs9 import assign_stage, simplified_ecl
from credit_risk_model.model import fit_model, score, validate
from credit_risk_model.monitoring import population_stability_index
from credit_risk_model.pipeline import run


def test_generation_is_reproducible():
    a = generate_portfolio(n=500, seed=7)
    b = generate_portfolio(n=500, seed=7)
    assert a.equals(b)


def test_target_not_in_model_features():
    assert "default_12m" not in MODEL_FEATURES
    assert "pd_12m_true" not in MODEL_FEATURES


def test_time_split_is_strictly_out_of_time():
    frame = generate_portfolio(n=1200)
    development, validation = time_split(frame)
    assert development["observation_date"].max() < validation["observation_date"].min()


def test_probabilities_and_validation_metrics_are_valid():
    frame = generate_portfolio(n=2400)
    development, validation = time_split(frame)
    model = fit_model(development)
    pd_hat = score(model, validation)
    metrics = validate(model, validation)

    assert np.all((pd_hat >= 0) & (pd_hat <= 1))
    assert 0.5 < metrics.auc <= 1.0
    assert 0.0 <= metrics.brier <= 1.0
    assert 0.0 <= metrics.ks <= 1.0


def test_stage_precedence():
    current_pd = [0.01, 0.05, 0.20, 0.10]
    origination_pd = [0.01, 0.02, 0.05, 0.08]
    dpd = [0, 0, 35, 95]
    default = [False, False, False, False]
    stage = assign_stage(current_pd, origination_pd, dpd, default)
    assert stage.tolist() == [1, 2, 2, 3]


def test_simplified_ecl_bounds():
    ecl = simplified_ecl([0.1, 0.8], [0.4, 0.7], [1000, 2000], 0.95)
    assert np.all(ecl >= 0)
    assert np.all(ecl <= np.array([1000, 2000]))


def test_psi_is_finite_and_nonnegative():
    frame = generate_portfolio(n=1800)
    development, validation = time_split(frame)
    psi = population_stability_index(development["utilization"], validation["utilization"])
    assert np.isfinite(psi)
    assert psi >= 0


def test_end_to_end_pipeline_runs():
    result = run(seed=123)
    assert result["development_rows"] > 0
    assert result["validation_rows"] > 0
    assert 0.5 < result["validation_auc"] <= 1.0
    assert set(result["stage_counts"]).issubset({"1", "2", "3"})
    assert result["total_simplified_ecl"] >= 0
