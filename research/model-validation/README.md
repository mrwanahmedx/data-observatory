# Credit Risk Model Validation Lab

Independent clean-room validation of synthetic probability-of-default models.

**Synthetic/public portfolio work only.** No employer data, model parameters, internal validation templates, or proprietary policies are used.

## Validation questions

The lab asks whether a model is:

- discriminatory enough to rank risk,
- calibrated enough to support probability interpretation,
- stable enough across samples,
- materially better than a simple benchmark,
- supported by enough events and observations,
- suitable for continued use, use with limitations, or redevelopment.

## Metrics

- ROC AUC and Gini,
- KS statistic,
- Brier score,
- calibration intercept and slope,
- fixed-bin observed vs predicted rates,
- population stability index (PSI),
- Poisson-binomial observed-vs-expected test for heterogeneous borrower PDs (independent-outcome assumption),
- challenger comparison,
- synthetic rating-migration matrix,
- governed override audit,
- deterministic Markdown validation report.

## Verdicts

The engine can return:

- `PASS`
- `PASS WITH LIMITATIONS`
- `REDEVELOPMENT REQUIRED`

Thresholds in this project are **illustrative governance rules for the synthetic demo**, not regulatory requirements and not employer policy.

## Files

- `validation_lab.py` — synthetic models, metrics, backtesting and verdict engine.
- `test_validation_lab.py` — regression tests.
- `VALIDATION_FRAMEWORK.md` — framework, interpretation and limitations.
- `RESULTS.md` — deterministic reference outcome and regression-suite status.

## Run

```bash
python -m pip install numpy pandas 'scipy>=1.15' scikit-learn
python research/model-validation/validation_lab.py
python -m unittest research/model-validation/test_validation_lab.py -v
```
