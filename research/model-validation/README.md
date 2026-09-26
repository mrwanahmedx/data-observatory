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
- binomial observed-vs-expected backtest,
- challenger comparison.

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

## Run

```bash
python -m pip install numpy pandas scipy scikit-learn
python research/model-validation/validation_lab.py
python -m unittest research/model-validation/test_validation_lab.py -v
```
