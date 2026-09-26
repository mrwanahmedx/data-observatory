# ADR-005 — Preserve material regressions and fixes in public history

**Status:** Accepted  
**Date:** 2026-09-26

## Context

A dashboard runtime regression temporarily caused the iScore browser app to fail after JSON loading.

## Decision

Do not hide the failure. Record the cause, fix, regression test, and CI control in Git history and the change log.

## Consequences

The repository shows that reliability work includes diagnosing failures, not merely presenting polished final output. Material regressions should produce a permanent preventive control where practical.
