# Data Dictionary

| Field | Grain | Description |
| --- | --- | --- |
| borrower_id | borrower observation | synthetic borrower identifier |
| observation_date | borrower observation | feature observation date |
| age_years | borrower observation | synthetic age |
| income_egp | borrower observation | synthetic monthly income |
| utilization | borrower observation | synthetic utilization ratio |
| debt_service_ratio | borrower observation | synthetic debt-service ratio |
| max_dpd_12m | borrower observation | maximum historical DPD |
| inquiries_6m | borrower observation | synthetic inquiry count |
| months_on_book | borrower observation | relationship age |
| segment | borrower observation | retail / micro / SME |
| origination_pd | staging reference | separately generated synthetic origination PD; excluded from model features |
| pd_12m_true | generation only | latent synthetic default probability; excluded from model features |
| default_12m | outcome | synthetic 12-month default indicator |
| lgd | loss assumption | synthetic LGD used only for ECL illustration |
| ead | exposure assumption | synthetic EAD used only for ECL illustration |

The public model feature contract is defined in `MODEL_FEATURES`. Outcome and latent-generation fields are excluded.
