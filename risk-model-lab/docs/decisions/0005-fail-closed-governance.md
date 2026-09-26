# ADR 0005 — Fail closed when evidence is invalid

**Status:** Accepted  
**Date:** 2026-09-26

## Context

Portfolio projects often hide failed assumptions and keep producing outputs even when the underlying data or controls are invalid.

## Decision

The lab raises errors for duplicate borrower grain, invalid scenario targets, and other broken contracts. Material failures should be recorded rather than bypassed.

## Consequences

- a failed run is treated as evidence about the pipeline,
- controls are visible to reviewers,
- the project will not silently invent substitute data or suppress broken joins,
- the same principle applies to EGX research and browser deployment regressions.
