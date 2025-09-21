# Prospecting Command Center

The Prospecting Command Center is a daily-use application for Commercial Loan Officers (CLOs) to discover, track, and engage local business prospects. It centralizes industry and location search, lead ingestion, CRM-lite workflows, collaboration, and compliance controls in a single secure workspace.

## Project Status
This repository currently contains a minimal Express skeleton that serves as a placeholder while the full Next.js + NestJS stack is developed. Use it to stand up a basic HTTP service in environments that require a running application.

```bash
npm install
npm start
# Server available at http://localhost:3000
```

## Key Capabilities (MVP)
- **Prospecting Search** – Keyword, NAICS/SIC, and multi-radius filters powered by PostGIS-backed queries and OpenSearch fuzzy matching.
- **Lead Source Ingestion** – CSV/XLSX uploads with column mapping, deduplication fingerprints, merge review, and rollback support.
- **Prospect Profiles** – CRM-lite records with contacts, notes, tasks, attachments, scoring breakdowns, and audit-ready activity history.
- **Signals Pipeline** – Daily RSS/HTML scrapes (Effingham County, IL initial focus) feeding a digest of ribbon cuttings, promotions, expansions, and other local events.
- **Product Matching & Messaging** – Rule-driven product suggestions, generated call scripts, intro email templates, and reusable snippet library.
- **Agent Portal & Security** – RBAC roles (Officer/Agent/Admin), credential vault integration, MFA-enforced SSO, field-level permissions, and exportable audit logs.

## Architecture Overview
- **Frontend**: React 18 + Next.js (App Router), TailwindCSS, Radix UI for responsive, data-first interfaces.
- **Backend**: NestJS services backed by PostgreSQL/PostGIS, Redis/BullMQ job queues, and OpenSearch for search/entity resolution.
- **Pipelines**: Modular ETL adapters for lead sources, RSS-first content fetchers with respectful HTML crawling fallback, and NLP-based signal extraction.
- **Infrastructure**: Containerized workloads deployed to cloud (AWS/GCP/Azure), managed Postgres/Redis, S3-compatible storage, and observability via OpenTelemetry + Sentry.

## Documentation
A comprehensive build brief, including product requirements, architecture decisions, data model, roadmap, and demo scripts, is available at [`docs/master-build-brief.md`](docs/master-build-brief.md).

## Next Steps
1. Stand up shared design system and Next.js shell.
2. Implement authentication/authorization with enterprise SSO and MFA.
3. Build prospecting search slice (geospatial queries + UI).
4. Expand ingestion adapters, signal processing jobs, and CRM-lite workflows iteratively behind feature flags.

Contributions should follow the roadmap and security controls outlined in the build brief.
