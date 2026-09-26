# ADR-001 — Use synthetic data for the Credit Lab

**Status:** Accepted  
**Date:** 2026-09-26

## Context

A credit-risk case study is more useful when it can expose source grain, feature logic, model outputs, validation tables, and SQL without creating privacy or employer-confidentiality risk.

## Decision

Use a fully synthetic borrower/account dataset for the public Credit Lab.

## Consequences

- No employer, bureau, customer, or confidential bank data is exposed.
- The full analytical workflow can be published and tested.
- Model results must not be presented as evidence of real-world bureau performance.
- Limitations must remain visible because the generator partly favors a logistic relationship and the cohort is synthetic.
