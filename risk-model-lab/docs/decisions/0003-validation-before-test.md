# ADR 0003 — Reserve the test sample for final evaluation

**Status:** Accepted  
**Date:** 2026-09-26

## Context

Using the test sample for calibration, threshold selection, or model iteration contaminates final performance evidence.

## Decision

Training data fits preprocessing and the baseline model. Validation data fits the probability calibrator and selects the demonstration operating threshold. The test sample is evaluated only after those choices are fixed.

## Consequences

- final metrics are less optimistic than repeated test-driven iteration,
- threshold choice remains illustrative because the data is synthetic,
- future challenger models must use the same split protocol.
