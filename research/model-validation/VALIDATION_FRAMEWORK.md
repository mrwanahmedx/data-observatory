# Validation Framework

## Scope

This lab demonstrates independent validation concepts for a synthetic probability-of-default model. It is a clean-room portfolio exercise, not an internal bank validation template.

## Validation dimensions

### Discrimination
ROC AUC, Gini and KS assess rank ordering. They do not prove calibrated probabilities.

### Calibration
The lab estimates calibration intercept and slope from model log-odds and compares observed with predicted rates in fixed probability bins.

### Probability accuracy
Brier score measures squared probability error. It combines elements of calibration and discrimination and should not be interpreted alone.

### Stability
PSI compares score/probability distributions between the synthetic development and test samples. The threshold used by the demo verdict engine is illustrative.

### Observed versus expected
An exact Poisson-binomial count distribution retains each borrower's own predicted probability instead of pooling them into one common PD. The two-sided demo p-value doubles the smaller exact tail (a conservative discrete-event convention). This assumes conditionally independent borrower outcomes; correlated defaults, model uncertainty and portfolio concentration remain outside scope.

### Challenger comparison
The lab compares incumbent and challenger AUC on aligned synthetic outcomes. A real validation would require broader statistical and economic comparison, data lineage review, implementation verification and use-test evidence.

### Rating migration
A transparent synthetic PD-to-grade mapping produces a prior-to-current migration matrix. The cutoffs are illustrative and exist only to demonstrate population conservation and migration diagnostics; they are not copied from a rating policy.

### Override governance
The lab audits synthetic overrides for unique borrower grain, in-range PDs, traceable reasons, population membership, direction and magnitude. It deliberately does not define who may approve an override or when one should be granted.

### Validation report
A deterministic Markdown renderer turns the quantitative result into a compact validation summary while retaining the explicit verdict, metric values and limitations.

## Verdict design

The engine returns:

- **PASS** — no demo threshold breach.
- **PASS WITH LIMITATIONS** — no hard redevelopment trigger, but one or more calibration/stability/probability-error concerns.
- **REDEVELOPMENT REQUIRED** — hard evidence such as insufficient events or weak discrimination breaches the configured demo threshold.

These verdict rules are intentionally visible in code. They are not regulatory requirements and are not copied from an employer policy.

## Independence and governance

A production-grade validation function should be organizationally independent of model development and should review data, design, implementation, performance, limitations, monitoring and change control. This public lab demonstrates only the quantitative subset.

## Limitations

- one synthetic cohort,
- simplified binary outcome,
- no out-of-time macroeconomic regime,
- no fairness assessment,
- override audit demonstrates traceability but not a real approval process,
- no implementation-replication testing against an external production engine,
- no economic-capital or provisioning use-test,
- no regulatory approval claim.

The point is to demonstrate validation discipline and transparent failure criteria, not to manufacture a passing model.
