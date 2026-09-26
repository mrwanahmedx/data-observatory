# ADR-003 — Define grain before joining one-to-many sources

**Status:** Accepted  
**Date:** 2026-09-26

## Context

Borrowers, accounts, account-month observations, inquiries, repayments, and model outputs exist at different grains. Direct joins can silently duplicate borrowers and overstate exposure or event counts.

## Decision

Every analytical query must:

1. state or imply its target grain,
2. deduplicate source entities deterministically where needed,
3. pre-aggregate one-to-many child tables,
4. join only after those controls,
5. reconcile duplicate keys / row counts at release gates.

## Consequences

The SQL is longer than toy examples, but the additional structure exists to prevent real analytical failure modes rather than to create decorative complexity.
