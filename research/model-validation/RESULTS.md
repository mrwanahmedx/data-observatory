# Tested Reference Result

GitHub Actions run: `Risk Research CI` on Python 3.12.

## Regression suite

**8 core tests passed on the previous main-branch run.** Two additional observed/expected regression tests have been proposed on the audit branch; their CI result must be checked before this section is updated.

The tests enforce the AUC/Gini identity, PSI zero for identical samples, calibration-bin population reconciliation, migration-matrix population conservation, override traceability, duplicate-override rejection, validation-report verdict propagation, and the rule that a deliberately poor synthetic model cannot receive an unconditional clean pass.

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
| O/E Poisson-binomial p-value | Pending fresh execution after the methodology correction |

### Limitations triggered

- calibration slope outside the illustrative demo range,
- calibration intercept outside the illustrative demo range,
- observed-versus-expected backtest rejects calibration.

This is intentional. The lab separates ranking from probability calibration and does not manufacture a clean verdict simply because AUC clears an illustrative threshold.


## Governance diagnostics

The deterministic demo also produces:

- a **1,200-borrower** prior-to-current synthetic rating migration matrix whose cells reconcile to the test population,
- an **8-record synthetic override audit** (0.67% of the test population) with reason, direction and magnitude controls,
- a deterministic Markdown validation summary carrying the quantitative verdict and limitations.

These are teaching controls. Rating cutoffs, override examples and governance thresholds are illustrative and are not copied from an employer policy.

**Reference freshness:** The earlier O/E p-value (9.68e-11) used a pooled-binomial approximation and must not be cited as the updated Poisson-binomial result. Refresh deterministic outputs and this reference table after audit-branch CI and merge.
