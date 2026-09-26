# Model Card — Synthetic 12-Month PD Baseline

## Intended use

Portfolio demonstration of credit-risk model development and validation discipline.

## Not intended for

- real lending decisions,
- regulatory capital,
- official IFRS 9 provisioning,
- production customer scoring,
- claims about any bank or bureau portfolio.

## Model

Logistic regression with standardized numeric inputs and one-hot encoded segment.

## Features

Age, income, utilization, debt-service ratio, maximum 12-month DPD, six-month inquiry count, months on book, and synthetic segment.

## Target

Synthetic 12-month default indicator.

## Validation design

Earlier observation cohorts are development data. Later cohorts are validation data. The split is time-based rather than randomly reshuffled across the full sample.

## Metrics

ROC AUC, Brier score, KS, event rate, mean predicted PD, calibration by risk decile, and selected PSI monitoring.

## Known limitations

The synthetic data-generating process includes relationships that a logistic model can learn. The project therefore tests workflow discipline more than challenger-model selection.
