# Architecture

## Source layer

Synthetic borrower, account, inquiry, and future-outcome tables are generated independently.

## Transformation layer

Account and inquiry tables are aggregated separately. The feature mart is constructed only after those one-to-many sources are reduced to borrower grain.

## Development layer

- numeric standardization,
- categorical one-hot encoding,
- logistic regression baseline,
- validation-set calibration,
- validation-set operating threshold.

## Validation layer

Held-out test metrics include discrimination, calibration, Brier score, KS and score PSI.

## Scenario layer

A transparent log-odds shift demonstrates how a common portfolio-level calibration movement changes absolute PD while preserving rank order.

## Evidence boundary

The architecture is intentionally small enough to audit. Complexity is added only where it serves a control or modeling purpose.
