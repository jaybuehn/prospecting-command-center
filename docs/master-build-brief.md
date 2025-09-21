# Prospecting Command Center — Master Build Brief

## 1. Vision & Success Criteria
- **Goal**: Deliver a single, daily-use web app that empowers Commercial Loan Officers (CLOs) to discover, track, and engage local business prospects with confidence.
- **Primary Personas**: Commercial Loan Officers using the system daily to manage prospecting and follow-up workflows.
- **Secondary Personas**: Support Agents (research assistants) who enrich data, and Admins who configure data sources, security, and policies.
- **North Star Metrics**: Qualified prospects discovered per officer per week, average time from lead discovery to first outreach, and officer adoption/retention.

## 2. Experience Principles
1. **Search-first**: Provide fast, geospatially-aware discovery across industries, keywords, and NAICS/SIC codes.
2. **Data confidence**: Deduplicate data sources, expose provenance, and make scoring transparent.
3. **Action-centric**: Focus on immediate next steps—tasks, scripts, and suggested products within one click.
4. **Secure collaboration**: Enforce RBAC, auditability, and controlled credential sharing without sacrificing usability.

## 3. Product Scope (MVP)
### 3.1 Prospecting by Industry & Location
- Filters: keyword, NAICS/SIC, industry tags, city/state, multi-radius filters (e.g., "within 20 miles of Effingham, IL").
- Geospatial backend (PostGIS) optimized for <1s p95 response on 10k records.
- Saved searches with optional daily alerts.

### 3.2 Lead Source Ingestion
- CSV/XLSX importer with column mapping, validation, deduplication preview, and rollback.
- Pluggable ingestion adapters (Chambers, recorder filings, CRE sales/listings, broker lists) with fingerprinting on legal name, DBA, address, phone, and domain.
- Human-in-the-loop merge flows for conflicting records.

### 3.3 Agent Access (Secure Portal)
- RBAC role: Agent with read/search access and enrichment tools.
- Credential vault (HashiCorp Vault or cloud secret manager) for third-party credentials; never display secrets after entry.
- Search activity logs with exportable audit trail.

### 3.4 Prospect Profiles (CRM-lite)
- Company overview with industry codes, size, age, and contact channels.
- Decision-makers with contact info, notes, tasks, attachments, and activity history.
- Prospect score with breakdown (industry fit, geo distance, growth signals, data completeness, recent activity).

### 3.5 Built-in Development Tools
- Product recommendation engine (rule-based with ML hooks) for SBA, CRE, equipment financing, treasury management, LOCs.
- Sales scripts & messaging: auto-generated call script, intro email, and printable letter templates with officer-specific tokens and editable snippet library.

### 3.6 Daily Local-News Scrubbing (Effingham County, IL to start)
- Scheduler (America/Chicago) running daily at 5:30 AM and on-demand.
- Source ingestion via RSS first, fallback to rate-limited HTML crawling respecting robots.txt.
- Content extraction with NER and regex to detect signals (e.g., grand openings, exec moves, acquisitions, expansions).
- Entity resolution to map to existing prospects; create stubs for new discoveries.
- Officer inbox for daily digest with one-click Add to Prospect, Link, or Ignore actions.

### 3.7 UX Requirements
- Desktop-first, responsive layout (React + Next.js App Router, Tailwind + Radix UI).
- Layout: global search, left filter panel, list/table results, detail tabs (Profile, Activities, Files, Signals).
- Kanban or priority flags (Hot / Nurture / Watch) for pipeline visualization.
- Inline note/task creation, notifications (in-app + optional email summary), WCAG 2.1 AA compliance.

### 3.8 Collaboration & Workflow
- Roles: Officer, Agent, Admin with RBAC enforcement across UI and API.
- Commenting with @mentions, task assignment, and preference prompts for first-time actions.

### 3.9 Security, Privacy & Compliance
- SSO/OIDC with MFA.
- Field-level permissions for PII, TLS 1.2+, encryption at rest, vaulted secrets with rotation.
- Full audit logging of reads/writes/exports.
- Respect external site ToS, keep fetch ceilings per source; no unauthorized scraping.
- Configurable data retention policies per tenant.

## 4. Architecture Overview
### 4.1 High-Level Diagram (textual)
```
[React/Next.js Frontend] ⇄ [API Gateway]
          │                    │
          │                    ├─▶ [NestJS (Node) Services]
          │                    │       ├─ Prospecting Service (PostgreSQL + PostGIS)
          │                    │       ├─ Lead Ingestion Service (object storage + Postgres)
          │                    │       ├─ Prospect CRM Service (activities, tasks)
          │                    │       ├─ Scoring Engine Service
          │                    │       └─ Auth/RBAC Service (SSO integration)
          │                    │
          │                    ├─▶ [BullMQ Workers (Redis)] for scrapers, ETL, scoring
          │                    │
          │                    └─▶ [Signal Processing Pipeline]
          │                            ├─ Source adapters (RSS/HTML)
          │                            ├─ Content extraction (Readability, NER)
          │                            └─ Entity resolution (fuzzy matching via OpenSearch)
          │
          └─▶ [S3-compatible Object Storage] for attachments & imports
```

### 4.2 Technology Stack
- **Frontend**: React 18 + Next.js (App Router), TypeScript, TailwindCSS, Radix UI, React Query, Mapbox/Leaflet for geo visualization.
- **Backend**: NestJS (TypeScript) service modules deployed in containers; FastAPI acceptable for specialist ML services.
- **Database**: PostgreSQL 15 with PostGIS extension; schema-managed via Prisma or TypeORM.
- **Search**: OpenSearch/Elasticsearch cluster for fuzzy search, autocomplete, and entity resolution.
- **Queue**: Redis + BullMQ for async jobs (scraping, dedupe, scoring, notifications).
- **Secrets**: HashiCorp Vault or AWS Secrets Manager.
- **Storage**: S3-compatible bucket for files, CSV imports, and cached HTML.
- **Observability**: Structured logging (pino), metrics (OpenTelemetry → Prometheus), tracing, and Sentry for error monitoring.

### 4.3 Deployment & Environments
- Containerized via Docker; orchestrated by ECS/Kubernetes (depending on cloud selection).
- Environments: Dev (feature flags, seeded data), Staging (pre-production, nightly refresh), Production.
- CI/CD: GitHub Actions with lint/tests, Docker build, vulnerability scans, infrastructure templates (Terraform).

## 5. Data Model Summary
| Entity | Key Fields | Notes |
| --- | --- | --- |
| **Company** | id, legal_name, dba, website, naics_code, sic_code, size, founded_year, addresses (geo), phones, emails, social_links, score | Address geocoded; supports multiple locations per company |
| **Person** | id, name, title, email, phone, linkedin_url, company_id | Decision-makers linked to Company |
| **ProspectProfile** | company_id, notes_richtext, stage, owner_user_id, next_action_at, created_at, updated_at | Stage values align with pipeline flags |
| **Activity** | id, company_id, type (call/email/meeting/note), content, user_id, timestamp | Audit-backed history |
| **LeadSource** | id, name, type (chamber/recorder/cre/broker/news), terms_url | Source metadata for compliance |
| **Signal** | id, company_id?, title, source_url, source_name, signal_type, published_at, extracted_entities (JSON), raw_excerpt, status (new/linked/ignored) | Linked to prospect when resolved |
| **Task** | id, company_id, assignee_user_id, due_at, status, description | Supports notifications |
| **SavedSearch** | id, user_id, filters_json, alert_daily | Tied to scheduler for digest emails |

### 5.1 Scoring Model
- **Industry Fit (0–30)**: based on NAICS/SIC match and target industry list.
- **Geodistance (0–20)**: computed via PostGIS ST_Distance with configurable radius preference.
- **Growth Signals (0–30)**: triggered by signals (ribbon cutting, expansions) and filings.
- **Data Completeness (0–10)**: evaluated by presence of contacts, website, revenue, filings.
- **Recent Activity (0–10)**: decays over time from last officer/agent touch.
- Expose scoring breakdown per prospect; Admins adjust weights via configuration UI.

## 6. Feature Deep-Dives
### 6.1 Prospecting Search Flow
1. Officer enters keywords/industry codes and selects radius anchors.
2. Frontend calls Prospecting Service with filters; PostGIS executes radial query; OpenSearch handles fuzzy name search.
3. Results displayed with map/list toggle, sort by score, filters, and quick save.
4. Officer can pin prospects to Kanban lanes or set follow-up tasks inline.

### 6.2 Lead Import Workflow
1. Officer/Admin uploads CSV/XLSX via Upload Wizard.
2. System infers columns and prompts for mappings with sample preview.
3. Deduplication service runs fingerprinting; flagged rows shown for merge decisions.
4. Import summary highlights inserted/updated/skipped records with ability to rollback via transaction log.

### 6.3 Signals Pipeline
1. Scheduler enqueues fetch jobs per configured source (RSS first, fallback to HTML crawler respecting robots.txt and rate limits).
2. Content extractor normalizes HTML, runs NER (spaCy) and regex to identify company names, executive titles, and signal keywords.
3. Entity resolution queries OpenSearch for fuzzy matches; scoring determines confident links vs. new stubs.
4. Officers see aggregated signals in daily digest and the in-app Signals Inbox.

### 6.4 Product Suggestions & Messaging
- Rule engine uses company attributes (industry, size, property ownership, lien history) to rank products.
- Officers can view rationale for each suggestion, adjust interest level, and trigger script/messaging generation.
- Messaging generator uses templated tokens; outputs editable call script, intro email, and printable letter.

### 6.5 Agent Portal
- Agents authenticate via SSO; limited scope to search external data sources and enrich records.
- Credential vault UI allows officers to store credentials; vault broker issues scoped tokens for agent jobs without exposing plaintext.
- Activity log records who accessed which credential-backed integration and when.

## 7. Security & Compliance Controls
- **Authentication**: Integrate with enterprise IdP via OIDC; enforce MFA.
- **Authorization**: Policy-based access control (e.g., casl.js) with field-level constraints for PII.
- **Data Protection**: TLS 1.2+, AES-256 at rest; attachments scanned for malware; secrets rotated regularly.
- **Auditability**: Immutable logs for all CRUD + export events, accessible via Admin UI with filters.
- **Compliance**: Documented data retention policies per tenant; ability to purge upon request; respect robots.txt and ToS.
- **Accessibility**: Design system targeting WCAG 2.1 AA; keyboard navigation and screen-reader support.

## 8. DevOps, Tooling & Quality
- **Testing Pyramid**: unit tests (Jest), integration tests (Supertest + Postgres test container), end-to-end tests (Playwright).
- **Static Analysis**: ESLint, TypeScript strict mode, Prettier, accessibility linting.
- **CI/CD Workflow**: GitHub Actions → lint/test → build Docker image → push to registry → deploy via IaC (Terraform Cloud or CDK).
- **Feature Flags**: LaunchDarkly or open-source alternative for incremental rollouts.
- **Observability**: SLOs for search (<1s p95), product suggestions (<300ms after profile load), CSV import success, signal pipeline freshness.

## 9. Implementation Roadmap (90-day MVP)
| Phase | Duration | Key Deliverables |
| --- | --- | --- |
| **Phase 0 – Foundations** | Weeks 1-3 | Auth (SSO/MFA), base data model, initial Next.js shell, CI/CD pipeline, Postgres + PostGIS setup |
| **Phase 1 – Prospecting Core** | Weeks 4-6 | Prospect search UI, saved searches, scoring baseline, OpenSearch integration |
| **Phase 2 – Lead Ingestion & CRM-lite** | Weeks 7-9 | CSV importer, dedupe workflow, prospect profiles, tasks & activities |
| **Phase 3 – Signals Pipeline** | Weeks 10-12 | Source adapters (3 Effingham sources), scheduler, Signals Inbox, digest notifications |
| **Phase 4 – Product Tools & Messaging** | Weeks 13-14 | Product recommendation engine, script/email templates, snippet library |
| **Phase 5 – Agent Portal & Compliance** | Weeks 15-16 | Credential vault integration, audit logs, admin dashboards |
| **Hardening & Launch Prep** | Weeks 17-18 | Performance tuning, accessibility review, documentation, staging UAT |

## 10. Demo Scenarios
1. **Discovery Workflow**: Search for "manufacturers within 30 miles of Effingham, IL," save search, prioritize top 10 via Kanban.
2. **Lead Import & Outreach**: Upload sample CRE filings, dedupe, auto-generate intro email, log outreach activity.
3. **Agent Collaboration**: Agent logs in, uses recorder search integration, attaches findings, officer reviews and assigns follow-up.
4. **Signals Digest**: Officer reviews daily signals, links ribbon-cutting news to existing prospect, ignores irrelevant ones.

## 11. Appendices
- **Glossary**: NAICS/SIC, RFP/RFQ, CRE, RBAC, SSO/OIDC, NER.
- **Future Integrations (Phase 2+)**: CRM export APIs (Salesforce, Dynamics), calendar sync (Outlook/Gmail), LinkedIn plugin hooks, map visualization overlays.
- **Non-Goals**: No mass email automation, no ToS-prohibited scraping, no full credit adjudication.

