# ADR 0001 — Use synthetic data only

**Status:** Accepted  
**Date:** 2026-09-26

## Context

The portfolio needs to demonstrate credit-risk modeling without exposing employer, bureau, customer, or confidential banking data.

## Decision

All Risk Model Lab inputs are generated synthetically inside the repository. No real borrower records, internal model parameters, policy thresholds, or confidential methods are used.

## Consequences

- the project can be public and reproducible,
- model performance cannot be interpreted as evidence of real-world credit accuracy,
- synthetic-generation assumptions must be disclosed,
- any future real-data extension requires a separate provenance and privacy review.
