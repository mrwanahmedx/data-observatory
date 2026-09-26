# Changelog

## 0.1.0 — 2026-09-26

Initial standalone-ready synthetic credit-risk model development lab.

- deterministic synthetic borrower portfolio,
- strict out-of-time development / validation split,
- transparent logistic-regression PD baseline,
- ROC AUC, Brier and KS validation,
- calibration-by-decile reporting,
- PSI monitoring example,
- illustrative IFRS 9-style staging and simplified ECL,
- independent synthetic origination PD reference kept outside the PD model feature set,
- model card, data dictionary, validation notes and ADRs,
- executable CI and regression tests,
- fixed pandas / NumPy index-alignment bug found by CI before release.
