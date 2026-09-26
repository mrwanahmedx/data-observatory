# ADR-002 — Keep a transparent logistic baseline

**Status:** Accepted  
**Date:** 2026-09-26

## Context

The portfolio needs to demonstrate model-development and validation logic without hiding the mechanics behind a complex challenger model.

## Decision

Use logistic regression as the primary public baseline.

## Why

- probability outputs are easy to interpret,
- coefficient-based behavior is transparent,
- calibration and threshold analysis are straightforward,
- it provides a defensible reference point before introducing more complex challengers.

## Consequences

The baseline is not claimed to be the best possible model. The case study is about disciplined construction, validation, and interpretation rather than maximizing a synthetic benchmark.
