# Model Governance

## Model purpose

Demonstrate an auditable synthetic PD-development lifecycle.

## Model owner

Portfolio / educational project owned by the repository author.

## Intended use

- demonstrate model-development structure,
- demonstrate grain and leakage controls,
- demonstrate validation metrics,
- demonstrate transparent calibration and scenario mechanics.

## Prohibited use

- real credit decisions,
- bureau scoring,
- customer treatment,
- IFRS 9 provisioning,
- regulatory capital,
- pricing,
- limit setting,
- production deployment.

## Development gates

| Gate | Control |
| --- | --- |
| source grain | borrower and outcome keys must be unique |
| join control | one-to-many sources aggregated before joins |
| reproducibility | explicit random seed |
| split discipline | borrower-disjoint train / validation / test |
| preprocessing | fit on training only |
| calibration | validation only |
| threshold choice | validation only |
| final evaluation | held-out test |
| stability | train-vs-test PSI |
| scenario mechanics | bounded target PD + monotonic common shift |

## Monitoring concepts

A production model would monitor:

- input quality and missingness,
- population / score PSI,
- segment mix,
- observed default rate,
- AUC / Gini / KS,
- calibration intercept / slope,
- override rates,
- model-use exceptions,
- realized-vs-expected default behavior.

This lab implements a subset sufficient to demonstrate the control framework.

## Change control

Material changes should be recorded in the repository changelog and, where architectural, in an ADR.
