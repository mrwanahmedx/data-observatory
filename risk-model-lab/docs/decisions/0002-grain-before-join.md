# ADR 0002 — Control grain before joins

**Status:** Accepted  
**Date:** 2026-09-26

## Context

Accounts and inquiries are one-to-many to borrowers. Directly joining both detail tables can multiply rows and distort exposure, delinquency, and repayment features.

## Decision

Every one-to-many source is independently aggregated to borrower grain before joining the model feature mart. Joins use one-to-one validation and the final mart asserts borrower-key uniqueness.

## Consequences

- fan-out risk becomes explicit,
- row-count reconciliation is easier,
- feature definitions remain auditable,
- additional detail sources must define their aggregation contract before entering the mart.
