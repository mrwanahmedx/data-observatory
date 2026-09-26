# ADR 0004 — Start with a transparent logistic baseline

**Status:** Accepted  
**Date:** 2026-09-26

## Context

A portfolio project can become less credible when model complexity is added before the data contract, leakage controls, calibration, and validation are trustworthy.

## Decision

Use a regularized logistic regression as the first model. Add challengers only after the baseline workflow is stable and any incremental complexity can be justified by evidence.

## Consequences

- coefficients and feature flow remain explainable,
- calibration behavior is easier to diagnose,
- the project emphasizes model-development discipline over leaderboard performance,
- future tree/boosting challengers must be compared against this baseline under identical splits and gates.
