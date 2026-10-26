# prd.md — Product Requirements Document

**Product:** AICTE Compliance & Approval Support System (ACAS) — *working name*
**Context:** Smart India Hackathon 2026 · AICTE · Software
**Version:** 1.0 · **Status:** Build-ready draft
**Companion files:** `pwd.md` (plan & tasks) · `readme.md` (repo front page)

> **Illustrative values.** Every ratio, threshold, weight, SLA day-count and risk cut-off in this document is a **demo setting**, not an official AICTE rule. Real values must be loaded from the current AICTE Approval Process Handbook (APH 2024-25 to 2026-27) with the clause reference recorded next to each rule.

---

## 1. Product summary

ACAS helps AICTE officers **verify, prioritise and monitor** institutions. It does **not** approve or reject anyone.

> **Rules identify compliance gaps. AI extracts and analyses information. Risk scoring prioritises scrutiny. Human officers keep final authority.**

One connected flow:

```
Application → 3-layer verification → Compliance report → Risk & priority
→ Officer scrutiny/inspection → Human decision + workflow tracking → Post-approval monitoring
```

Drift monitor, ghost-faculty detection and Document AI are **stages inside this flow**, not separate tools. All of them write to the same application record and the same report.

### 1.1 Problem statements covered
| Statement | What ACAS covers |
|---|---|
| Approval workflow automation, compliance monitoring and alerts (SIH26262) | State machine, SLA/escalation, dashboards, audit trail, post-approval monitoring |
| AI-powered application validation, document authentication and compliance verification (SIH26261) | Rule engine, Document AI, cross-record checks, risk scoring |

> **Decide early which statement you submit under.** Judges score against the statement you select. Lead the pitch with that statement's evaluation criteria and present the other half as supporting depth.

### 1.2 Honest positioning (important for judges)
AICTE already has an online portal and online scrutiny/EVC processes. **Do not** claim it is manual or that nothing exists. ACAS targets:
- more systematic cross-checking of declared vs evidenced data,
- consistent rule-by-rule results,
- evidence-based prioritisation,
- one consolidated view of deadlines and follow-ups,
- continuous (not one-time) compliance monitoring.

Gaps are *opportunities our design addresses*, to be validated against the real portal's capabilities before being presented as confirmed deficiencies.

---

## 2. Principles & safeguards (non-negotiable)

1. **Human authority.** No automated approve/reject. Decision recording is role-gated to the competent authority.
2. **Advisory output.** Risk colours, flags and recommendations are labelled *advisory*. A risk colour is never a decision.
3. **Explainability.** Every flag shows inputs, rule/threshold, calculation, evidence and source. No colour without reasons.
4. **Suspicion, not accusation.** Duplicate PAN, short tenure or drift are *signals for investigation*, never proof of fraud.
5. **AI is assistive.** OCR/AI extracts; it does not certify a document as genuine. Low-confidence results go to a human.
6. **Rules are data.** Thresholds and formulas live in the database/config with version and source clause.
7. **Workflow timers don't replace statutory timelines** or change the prescribed AICTE procedure.
8. **Backend decides.** The browser never makes regulatory calculations or workflow transitions.
9. **Synthetic data only** in the prototype.

---

## 3. Goals & non-goals

### Goals
- G1. Configurable rule engine producing rule-by-rule results (required, actual, shortfall, status, explanation).
- G2. Document AI that extracts selected fields and compares them with declared values, with confidence.
- G3. Cross-record validation (duplicate faculty identifiers; employment-history anomalies).
- G4. Unified verification report + deficiency list.
- G5. Configurable, explainable risk score (Green/Amber/Red).
- G6. Workflow state machine with SLA timers, alerts, escalations and audit history.
- G7. Faculty drift monitor producing a compliance timeline after approval.
- G8. One coherent end-to-end demo built on synthetic colleges.

### Non-goals
- Replacing AICTE's portal, committees or decision authority.
- Automated approval/rejection.
- Certifying document authenticity (forgery detection) — only *reading and comparing*.
- Handling real personal data (PAN, etc.) in the prototype.
- Payments, student admissions, accreditation scoring.

---

## 4. Users & roles

| Role | Does | Cannot |
|---|---|---|
| **College User** | Submit application, faculty & student data, upload documents; answer deficiencies | See other colleges; see risk scores (configurable) |
| **Scrutiny Officer** | Review report & evidence; request corrections; record scrutiny outcome | Record final decision |
| **EVC Member / Coordinator** | View assigned visits; upload inspection findings/photos | Change rules |
| **Regional / Bureau Officer** | Monitor pendency, risk list, escalations | Record final decision (unless authorised) |
| **Competent Authority** | Record final decision (LoA / LoD / LoR) | — |
| **Admin** | Manage users, rules, risk weights, SLA settings, templates | Record decisions |
| **Auditor (read-only)** | View logs, reports, chain verification | Edit anything |

Access control: RBAC + scope (college / region).

---

## 5. End-to-end workflow

| # | Stage | What happens | Output |
|---|---|---|---|
| 1 | **Submission** | College submits faculty, students, infrastructure, documents | Application record (`SUBMITTED`) |
| 2 | **Three-layer verification** | Rule engine + Document AI + cross-record validation run automatically | Verification results |
| 3 | **Compliance report & deficiency list** | Results consolidated: Pass / Fail / Missing evidence / Needs human review | Report (+ PDF, P2) |
| 4 | **Risk & prioritisation** | Flags combined into a score with reasons | Green / Amber / Red + top reasons |
| 5 | **Officer scrutiny & inspection** | Officer reviews evidence, requests corrections, records inspection | Scrutiny/EVC records |
| 6 | **Human decision & tracking** | Committee process, due dates, alerts, escalations; competent authority decides | Decision record (LoA/LoD/LoR) |
| 7 | **Post-approval monitoring** | Faculty drift, certificate expiry, updated compliance status | Alerts + timeline |

---

## 6. Functional requirements

Priority: **L1** = core (must), **L2** = differentiator (USP), **L3** = supporting (if time).

### M1 — Application & data intake  *(L1)*
| ID | Requirement |
|---|---|
| M1.1 | College registers/logs in; creates application for programme category & academic year |
| M1.2 | Forms for institution details, students count, faculty roster (name, designation/cadre, qualification, PAN/ID, join date, leave date, type: regular/guest/contractual), infrastructure (land, built-up, labs, library), certificates (Fire NOC, land/lease, etc.) |
| M1.3 | Bulk upload (CSV) for faculty roster with validation errors shown per row |
| M1.4 | Document upload (PDF/image) with type tag, size/type validation, checksum, versioning |
| M1.5 | Draft save and submit; submission locks data version (new corrections create a new version) |

### M2 — Rule engine  *(L1)*
| ID | Requirement |
|---|---|
| M2.1 | Rules stored as versioned configuration (see §7.1), not code |
| M2.2 | Initial **six** rules implemented (see §7.1.2) |
| M2.3 | For each rule output: `required`, `actual`, `shortfall`, `status` (`PASS`/`FAIL`/`MISSING_EVIDENCE`/`NEEDS_REVIEW`), `explanation`, `rule_version`, `source_clause` |
| M2.4 | Changing a rule's configuration changes subsequent evaluations; past reports keep the rule version used |
| M2.5 | Admin UI to view/edit rule parameters (audited) |
| M2.6 | Deterministic and unit-tested; same input → same output |

### M3 — Document AI  *(L2)*
| ID | Requirement |
|---|---|
| M3.1 | Pipeline: upload → OCR → field extraction → backend validation → compare with declared → store result |
| M3.2 | Initial document: **Fire NOC** — extract expiry date (and optionally issue date, issuing authority, certificate no.) |
| M3.3 | Store extracted value, **confidence**, page/region reference, raw text snippet |
| M3.4 | Mismatch rules: `MATCH`, `MISMATCH`, `LOW_CONFIDENCE`, `UNREADABLE` |
| M3.5 | UI shows declared vs extracted side by side with the original document viewer |
| M3.6 | Low confidence/unreadable → status `NEEDS_REVIEW`; never auto-pass or auto-fail on AI alone |
| M3.7 | Extraction is **assistive**: officer can confirm/override, and the override is audited |
| M3.8 | LLM output must be schema-validated (date format, plausible range); invalid → `NEEDS_REVIEW` |

### M4 — Cross-record validation / ghost-faculty signals  *(L2)*
| ID | Requirement |
|---|---|
| M4.1 | Detect same faculty identifier (PAN or ID) across multiple colleges |
| M4.2 | Classify signal strength: **overlapping** employment periods = stronger; **non-overlapping** = weak/informational |
| M4.3 | Detect unusual employment patterns (see §7.5): short tenure around application/inspection, burst joins/leaves |
| M4.4 | Every flag has supporting evidence (records, dates, colleges) and disclaimer text: *signal for investigation* |
| M4.5 | Officer can mark a flag **Reviewed – Explained / Reviewed – Escalate / Dismissed** with reason (audited) |
| M4.6 | Store identifiers as keyed hash (HMAC) for matching; show masked values in UI |

### M5 — Verification report & deficiency list  *(L1)*
| ID | Requirement |
|---|---|
| M5.1 | One consolidated report per application version combining M2, M3, M4 results |
| M5.2 | Sections: summary, rule results, document discrepancies, cross-record flags, missing evidence, needs-human-review |
| M5.3 | Deficiency matrix (table) per rule/document with status and required action |
| M5.4 | PDF export *(L3)* |

### M6 — Risk scoring & prioritisation  *(L2)*
| ID | Requirement |
|---|---|
| M6.1 | Configurable weights per flag type and severity (see §7.6) |
| M6.2 | Output: score 0–100, band (Green/Amber/Red), **top contributing reasons** |
| M6.3 | Confidence-aware: low-confidence AI flags count less and are labelled |
| M6.4 | Dashboard list sorted by risk and by time-to-SLA-breach |
| M6.5 | Disclaimer on every view: *Advisory – not an approval or rejection* |

### M7 — Workflow, SLA & alerts  *(L1)*
| ID | Requirement |
|---|---|
| M7.1 | State machine (see §7.7) with backend-enforced allowed transitions per role |
| M7.2 | Each transition records actor, time, reason, previous/next state; next due date is assigned from SLA settings |
| M7.3 | SLA monitor (background job): upcoming-deadline warning, overdue flag, escalation to configured officer |
| M7.4 | Clock pause/resume when returned to the college for correction (officer clock vs college clock) |
| M7.5 | In-app notifications + email (stub acceptable); de-duplicated; stored with delivery status |
| M7.6 | Escalation ladder: level 1 (assignee) → level 2 (regional officer) → level 3 (bureau) with thresholds |
| M7.7 | Workflow timers are internal management aids and labelled so |

### M8 — Faculty drift monitor  *(L2, main USP)*
| ID | Requirement |
|---|---|
| M8.1 | Build monthly faculty snapshots from join/leave dates (see §7.5) |
| M8.2 | Compute strength, student count, FSR, required, shortfall per month |
| M8.3 | Timeline chart: faculty count vs required, with markers for application, inspection, approval |
| M8.4 | Alerts: dropped below requirement; churn spike near verification events; short-tenure clusters; guest/contractual faculty appearing only around verification |
| M8.5 | Each alert links to the underlying faculty records |
| M8.6 | Monitoring job runs on schedule (and on demand in demo mode) |

### M9 — Dashboards  *(L1)*
| ID | Requirement |
|---|---|
| M9.1 | **Officer dashboard:** counts by state, risk bands, overdue, due-soon, top flagged colleges, filters (region, programme, state) |
| M9.2 | **Case view:** timeline of workflow, report, evidence viewer, flags, notes, next action |
| M9.3 | **College portal:** application status, deficiencies to fix, upcoming deadlines (certificate expiry) |
| M9.4 | **Monitoring view:** faculty drift timeline and alerts |
| M9.5 | Bureau-level heatmap *(L3)* |

### M10 — Audit & governance  *(L1 basic / L3 tamper-evident)*
| ID | Requirement |
|---|---|
| M10.1 | Append-only audit log of logins, edits, uploads, rule changes, evaluations, flags, overrides, transitions, decisions |
| M10.2 | Hash-chain each record to the previous one; admin "Verify chain" function *(L3)* |
| M10.3 | Decision gate: only the Competent Authority role can record LoA/LoD/LoR |
| M10.4 | Every rule evaluation stores the rule version and inputs used |

### M11 — Supporting enhancements  *(L3)*
College compliance scorecard · deficiency PDF · inspection photo/evidence upload · QR-verifiable **demo** certificates (clearly marked prototype) · bureau heatmap · tamper-evident audit verifier.

---

## 7. Specifications

### 7.1 Rule engine

#### 7.1.1 Rule configuration schema (example)
```json
{
  "rule_id": "FSR-001",
  "name": "Faculty–student ratio",
  "applies_to": { "programme": "ENGG_UG", "application_type": ["NEW", "EXTENSION"] },
  "type": "ratio_min",
  "params": { "students_per_faculty": 20 },
  "formula": "required = ceil(students / students_per_faculty); shortfall = max(required - actual, 0)",
  "severity": "HIGH",
  "source_clause": "<<fill from APH>>",
  "effective_from": "2026-04-01",
  "version": 1,
  "enabled": true
}
```
> `students_per_faculty: 20` is an **illustrative** demo value.

#### 7.1.2 Initial six rules (suggested; confirm with APH)
| ID | Rule | Inputs | Output |
|---|---|---|---|
| FSR-001 | Faculty–student ratio | students, faculty count | required, shortfall |
| CAD-002 | Faculty cadre distribution | counts by cadre | per-cadre shortfall |
| QUA-003 | Faculty qualification minimum | faculty qualifications | count not meeting min |
| LND-004 | Land / built-up area requirement | land area, built-up area, programme | area shortfall |
| LAB-005 | Laboratory requirement | labs declared per programme | missing labs |
| CRT-006 | Certificate validity (Fire NOC, others) | expiry date vs reference date | valid / expired / expiring-soon |

#### 7.1.3 Worked example (demo)
ABC College: 600 students, 25 faculty, demo ratio 1:20
`required = ceil(600/20) = 30` → `shortfall = 30 − 25 = 5` → **FAIL** (assumed demo rule).

#### 7.1.4 Rule result object
```json
{
  "rule_id": "FSR-001", "rule_version": 1,
  "inputs": { "students": 600, "actual": 25, "students_per_faculty": 20 },
  "required": 30, "actual": 25, "shortfall": 5,
  "status": "FAIL",
  "explanation": "Required 30 faculty for 600 students at 1:20; 25 recorded; shortfall 5."
}
```

### 7.2 Document AI pipeline (Fire NOC)
1. Upload → store file + SHA-256.
2. OCR (e.g., Tesseract/PaddleOCR; for scanned PDFs use page rasterisation).
3. Extraction by (a) regex/date patterns near keywords ("valid up to", "expiry"), and/or (b) LLM with a strict JSON schema.
4. Validate: parseable date; plausible range; issuing authority present (optional).
5. Compare with declared date → `MATCH` / `MISMATCH`.
6. Confidence = combined OCR confidence + extraction method confidence; below threshold → `LOW_CONFIDENCE`.
7. Store `{field, extracted, declared, confidence, page, snippet, status}`.
8. UI shows both values + document viewer; officer confirms/overrides.

**Failure handling:** OCR fails or no date found → `UNREADABLE` → `NEEDS_REVIEW`. Never silently pass.

### 7.3 Declared vs extracted comparison states
| State | Meaning | Report status |
|---|---|---|
| MATCH | Same date, confidence ≥ threshold | PASS (for that check) |
| MISMATCH | Dates differ | FAIL → review |
| LOW_CONFIDENCE | Match/mismatch unreliable | NEEDS_REVIEW |
| UNREADABLE | Nothing usable extracted | NEEDS_REVIEW / MISSING_EVIDENCE |

### 7.4 Duplicate identifier detection
```
For each faculty identifier hash H appearing in ≥2 colleges:
  periods = employment [join, leave or open-ended] per college
  if any two periods overlap  → flag DUPLICATE_OVERLAP   (severity HIGH)
  else                        → flag DUPLICATE_SEQUENTIAL (severity LOW, informational)
Attach: colleges, designations, dates, record ids.
Disclaimer: possible data entry error or legitimate move; investigate before concluding.
```

### 7.5 Faculty drift monitor
**Snapshot for month-end `m`:** a faculty member counts if `join_date ≤ m` and (`leave_date` is null or `leave_date > m`). Then compute strength, required (via FSR rule), shortfall.

**Alert types (all thresholds configurable, values illustrative):**
| Alert | Condition |
|---|---|
| `BELOW_REQUIREMENT` | month strength < required |
| `CHURN_NEAR_EVENT` | joins+leaves in ±30 days of application/inspection date > X% of strength |
| `SHORT_TENURE_CLUSTER` | ≥ K faculty with tenure < T days spanning an event date |
| `EVENT_ONLY_PRESENCE` | guest/contractual records that exist only around an event window |
| `CERT_EXPIRING` | certificate expiry within N days |

Output: monthly series + alert list with linked records. No automatic fraud labelling.

### 7.6 Risk scoring (illustrative)
```
score = min(100, Σ  weight[flag_type] × severity_factor × confidence_factor )
severity_factor:  LOW=0.5, MEDIUM=1.0, HIGH=1.5
confidence_factor: 1.0 for rule/DB-derived flags; AI-derived = extraction confidence
Bands: Green < 30 · Amber 30–59 · Red ≥ 60     (configurable, to be validated)
```
Example weights: rule FAIL (high) 25 · Fire NOC mismatch 20 · duplicate overlap 25 · drift below requirement 15 · churn near event 10 · missing evidence 10.

Output includes `top_reasons` (sorted by contribution) and the formula inputs.

### 7.7 Workflow state machine
```
DRAFT → SUBMITTED → AUTO_VERIFICATION → SCRUTINY ⇄ RETURNED_FOR_CORRECTION
SCRUTINY → EVC_PENDING → EVC_COMPLETED → COMMITTEE → DECISION_PENDING
DECISION_PENDING → {LOA_ISSUED | LOD_ISSUED | LOR_ISSUED} → MONITORING
(EVC_* skipped when not applicable)
```
| Transition | Allowed roles | Side effects |
|---|---|---|
| DRAFT→SUBMITTED | College | Lock version; trigger verification |
| AUTO_VERIFICATION→SCRUTINY | System | Report + risk generated; assign officer; set SLA |
| SCRUTINY→RETURNED_FOR_CORRECTION | Scrutiny Officer | Reason required; pause officer clock; start college clock |
| RETURNED→SCRUTINY | College (resubmit) | New data version; re-verify; resume clock |
| SCRUTINY→EVC_PENDING | Scrutiny Officer | Queue EVC; SLA for scheduling |
| EVC_COMPLETED→COMMITTEE | EVC Coordinator | Attach findings |
| COMMITTEE→DECISION_PENDING | Regional/Bureau Officer | Case summary generated |
| DECISION_PENDING→LOA/LOD/LOR | **Competent Authority only** | Decision recorded; audit |
| LOA_ISSUED→MONITORING | System | Start drift/expiry monitoring |

Illegal transitions return `409` and are logged.

### 7.8 SLA & escalation (illustrative defaults)
| State | SLA (working days) | Warn at | Escalate at |
|---|---|---|---|
| SCRUTINY | 10 | 70% | due +1 → Regional, +3 → Bureau |
| RETURNED_FOR_CORRECTION (college) | 15 | 70% | due +1 → reminder, +5 → flag overdue |
| EVC_PENDING (scheduling) | 7 | 70% | due +1 → Regional |
| COMMITTEE | 10 | 70% | due +1 → Bureau |
Values are **configurable demo settings**, not statutory timelines.

---

## 8. Data model (core tables)

| Table | Key columns |
|---|---|
| `colleges` | id, name, region, type, registered_at |
| `users` | id, name, email, role, college_id?, region? |
| `applications` | id, college_id, programme, type, academic_year, state, version, risk_score, risk_band, submitted_at |
| `application_versions` | id, application_id, version, data_json, created_at |
| `students_summary` | application_id, programme, intake, total_students |
| `faculty` | id, college_id, name, designation, cadre, qualification, id_hash, id_masked, type, join_date, leave_date |
| `documents` | id, application_id, type, filename, sha256, uploaded_by, version |
| `document_extractions` | id, document_id, field, extracted_value, declared_value, confidence, status, page, snippet, reviewed_by? |
| `rules` | id, rule_id, name, type, params_json, severity, source_clause, effective_from, version, enabled |
| `rule_results` | id, application_version_id, rule_id, rule_version, inputs_json, required, actual, shortfall, status, explanation |
| `flags` | id, application_id, flag_type, severity, confidence, evidence_json, status (open/reviewed/dismissed), reviewer, reason |
| `risk_assessments` | id, application_id, score, band, reasons_json, weights_version |
| `workflow_events` | id, application_id, from_state, to_state, actor, reason, at |
| `tasks` | id, application_id, type, assignee, due_at, clock_owner, status, escalation_level |
| `notifications` | id, user_id, type, payload, channel, status, sent_at, dedupe_key |
| `monitoring_snapshots` | id, college_id, month, strength, students, required, shortfall |
| `inspections` | id, application_id, evc_member, visit_date, findings, evidence_files |
| `decisions` | id, application_id, type (LoA/LoD/LoR), authority_user, note, at |
| `audit_log` | id, ts, actor, action, entity, before, after, prev_hash, hash |
| `settings` | key, value_json, version (risk weights, SLA, thresholds) |

---

## 9. API contract (v1)

Base `/api/v1` · JWT auth · JSON · errors `{code, message, details}`.

| Method & path | Purpose | Roles |
|---|---|---|
| `POST /auth/login` | Login | all |
| `POST /applications` | Create application | College |
| `PUT /applications/{id}` | Update draft data | College |
| `POST /applications/{id}/submit` | Submit & lock version | College |
| `POST /applications/{id}/documents` | Upload document | College |
| `POST /applications/{id}/validate` | Run all verification layers | System/Officer |
| `GET /applications/{id}/report` | Consolidated compliance report | Officer, College (scoped) |
| `GET /applications/{id}/risk` | Risk score, band, reasons | Officer |
| `GET /applications/{id}/flags` | List flags with evidence | Officer |
| `POST /flags/{id}/review` | Mark flag reviewed/dismissed with reason | Officer |
| `GET /applications/{id}/documents/{docId}/extraction` | Declared vs extracted | Officer |
| `POST /extractions/{id}/override` | Officer confirms/overrides value | Officer |
| `POST /applications/{id}/transition` | Request workflow transition | per state machine |
| `POST /applications/{id}/decision` | Record LoA/LoD/LoR | Competent Authority |
| `GET /applications/{id}/timeline` | Workflow + audit events | Officer |
| `GET /colleges/{id}/faculty-trend` | Monthly monitoring series + alerts | Officer, College (scoped) |
| `POST /monitoring/run` | Run monitoring job (demo/admin) | Admin |
| `GET /dashboard/summary` | Counts, risk bands, overdue | Officer |
| `GET /tasks?assignee=me` | My tasks & due dates | Officer |
| `GET /rules` · `PUT /rules/{id}` | View/edit rule config (versioned) | Admin |
| `GET /settings` · `PUT /settings` | Risk weights, SLA settings | Admin |
| `GET /audit/verify` | Verify hash chain | Admin, Auditor |
| `POST /sim/advance` | Advance simulated time (demo only) | Admin |

---

## 10. Architecture

```
Next.js (College portal · Officer dashboard · Reports · Alerts)
        │ REST/JSON
FastAPI  (Auth · API · Workflow · Rule evaluation · Risk · Monitoring)
        │                      │
 PostgreSQL            Redis + worker (Celery/RQ/Arq)
 (records, rules,       ├─ SLA monitor (scheduled)
  audit, snapshots)     ├─ Document AI tasks (async)
        │               └─ Monitoring job (scheduled)
 Object storage (MinIO/local) ← documents
 Verification services: rule engine · OCR/Document AI · duplicate detector · drift monitor · risk scorer
```
- Backend owns calculations and workflow control.
- Long-running tasks (OCR/LLM) run asynchronously; UI polls status.
- Frontend can be built against mocks from the shared API contract.

**Stack:** Next.js + TypeScript + Tailwind · FastAPI + Pydantic + SQLAlchemy/Alembic · PostgreSQL · Redis · Tesseract/PaddleOCR (+ LLM API with schema validation) · Docker Compose · pytest · Playwright (optional).

---

## 11. Non-functional requirements

| Area | Requirement |
|---|---|
| Correctness | Rule/date logic deterministic; unit-tested; ≥ 95% coverage on rule & scoring modules |
| Explainability | Every flag/score reproducible from stored inputs and versions |
| Reliability | Scheduler restart-safe (catch-up of missed alerts); idempotent jobs |
| Security | RBAC + scope; password hashing; JWT expiry; upload validation; secrets via env; HTTPS in deployment |
| Privacy | Synthetic data; identifiers hashed + masked; review DPDP Act 2023 implications before any real use |
| Performance | Validate an application in < 15 s excluding OCR; OCR async; dashboard < 2 s on 1,000 seeded applications |
| Accessibility | Keyboard-navigable, readable contrast, GIGW/WCAG basics |
| Observability | Structured logs; job status; failed-notification list |
| Portability | `docker compose up` runs the full stack |

---

## 12. Synthetic data & acceptance scenarios

Seed ≥ 10 colleges. Five **named** scenarios with known expected outputs:

| # | Scenario | Setup | Expected result |
|---|---|---|---|
| S1 | **Clean college** | Faculty ≥ required, valid NOC, no duplicates | All rules PASS; risk Green |
| S2 | **Faculty shortfall (ABC)** | 600 students, 25 faculty, demo 1:20 | FSR-001 FAIL, required 30, shortfall 5 |
| S3 | **Fire NOC mismatch** | Declared Dec 2026, document shows Nov 2026 | Extraction MISMATCH; flag; needs review |
| S4 | **Duplicate PAN** | Same ID hash in ABC & XYZ with overlapping dates | DUPLICATE_OVERLAP flag (HIGH) |
| S5 | **Drift** | Faculty count drops below required after approval; burst of short-tenure guest faculty near inspection | BELOW_REQUIREMENT + SHORT_TENURE_CLUSTER alerts; timeline shows both |
| S6 | **Combined (ABC)** | S2 + S3 + S4 together | Risk Red with top reasons listing all three |
| S7 | **Unreadable NOC** | Blurry scan | UNREADABLE → NEEDS_REVIEW (no auto pass/fail) |
| S8 | **SLA breach** | Scrutiny not completed on time | Warning → overdue → escalation (via sim time) |

Each scenario has an automated test asserting the expected output.

---

## 13. Demo script (~6 min)

1. College portal: ABC College submits application (faculty CSV + Fire NOC PDF).
2. Auto-verification runs → **report** shows: faculty shortfall (5), NOC date mismatch, duplicate faculty ID with XYZ.
3. **Risk = Red**, with the three top reasons; open each flag to show evidence.
4. Officer reviews NOC side by side with the original document; marks one flag "explained".
5. Officer returns for correction → clock pauses → college resubmits.
6. **Simulated time +N days** → warning → overdue → escalation to regional officer.
7. Competent Authority records decision (try as another role → blocked).
8. Post-approval: monitoring timeline shows drift below requirement + short-tenure cluster.
9. (L3) Verify audit chain.

---

## 14. Success metrics (prototype)

| Metric | Target |
|---|---|
| Scenarios S1–S8 produce expected outputs | 100% |
| Rule calculations match hand-computed set | 100% |
| Fire NOC extraction on prepared sample set | Report accuracy honestly (e.g., n correct / n total) |
| False auto-pass on unreadable/low-confidence docs | 0 |
| Transitions not permitted by state machine accepted | 0 |
| Alerts fired for simulated deadlines | 100% |
| Every flag shows evidence | 100% |

---

## 15. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Using wrong ratios/thresholds | Load from APH; show `source_clause`; label demo values as illustrative |
| Overclaiming ("AICTE has no digital system") | Use the positioning in §1.2 |
| OCR/LLM errors on date | Confidence, schema validation, side-by-side view, human confirmation |
| Ghost-faculty accusation | "Signal, not proof" wording; review workflow; sequential vs overlapping distinction |
| Feature sprawl | L1 first → L2 → L3; one end-to-end story |
| Demo failure | Seeded data, offline OCR fallback (pre-computed results), recorded backup demo |
| Mixed problem statements dilute the pitch | Choose the primary statement; map features to its criteria |
| Personal-data exposure | Synthetic data, hashed IDs |

---

## 16. Open questions
1. Which problem statement is the primary submission?
2. Exact APH formulas per programme category for the six rules.
3. Which fields appear on a real Fire NOC (get 2–3 public samples to test extraction).
4. Which officer roles/authority matrix to model.
5. Whether real AICTE data/APIs are accessible (assume no).
6. LLM/OCR provider and cost limits for the demo.
