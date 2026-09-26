# Tested Reference Result

GitHub Actions run: `Risk Research CI` on Python 3.12.

## Regression suite

**4 core tests passed.**

The tests enforce the AUC/Gini identity, PSI zero for identical samples, calibration-bin population reconciliation, and the rule that a deliberately poor synthetic model cannot receive an unconditional clean pass.

## Synthetic validation result

The deterministic weak-model demonstration returned:

**PASS WITH LIMITATIONS**

| Metric | Result |
| --- | ---: |
| ROC AUC | 0.6530 |
| Gini | 0.3059 |
| KS | 0.2212 |
| Brier score | 0.1080 |
| PSI | 0.0160 |
| Test events | 125 |
| Observed event rate | 10.42% |
| Predicted event rate | 17.06% |
| Calibration intercept | -1.4093 |
| Calibration slope | 0.4289 |
| O/E binomial p-value | 9.68e-11 |

### Limitations triggered

- calibration slope outside the illustrative demo range,
- calibration intercept outside the illustrative demo range,
- observed-versus-expected backtest rejects calibration.

This is intentional. The lab separates ranking from probability calibration and does not manufacture a clean verdict simply because AUC clears an illustrative threshold.
