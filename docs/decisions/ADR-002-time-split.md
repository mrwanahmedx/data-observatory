# ADR-002 — Use out-of-time validation rather than random reshuffling

**Status:** Accepted

A random split can hide temporal drift. The project therefore develops on earlier observation cohorts and validates on later cohorts. Tests enforce strict date separation.
