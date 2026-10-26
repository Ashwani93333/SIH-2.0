# SETU / AICTE FlowGuard: Process and Screen Specification

Use this file as project context for Antigravity (or any coding agent). It describes the process the UI already shows, the roles, the data, the rules, and where the SETU intelligence features plug in.

Status: prototype. All data is synthetic. Not an official AICTE system. Humans make every decision.

---

## 0. How to use this file

1. Put this file in the repo root (or `docs/`) and tell the agent: "Read SETU_PROCESS_SPEC.md first. Do not rename existing routes or models. Add tests for every change."
2. Build in the order of section 12.
3. Principles that must never be broken:
   - Rules decide (plain deterministic code). AI only reads documents and writes explanations.
   - Every flag is advisory and shows its rule and evidence.
   - Final decisions are made by an authorised officer, and each one is written to the audit log.
   - Every number shown in the UI must come from the database or a computation, never typed into the page.

---

## 1. What the UI shows today (from the demo video)

Brand: "AICTE Approve". Footer: "AICTE FlowGuard • Regulatory Approval & Statutory Compliance System (Standalone Presentation Mode)".

Landing page: "Unified Regulatory Architecture for AICTE Approvals". Institutional access offers New Institutions (LOA, Letter of Approval) and Existing Institutions (EOA, Extension of Approval), plus "Start Institution Registration". Three feature chips: Scoped RBAC, Multi-Stage Scrutiny, Immutable Audit.

Top bar: role dropdown, notification bell (badge count), user card.

### 1.1 Roles, demo users, and navigation

| Role | Demo user | Navigation tabs |
|---|---|---|
| Institution | Delhi Institute of Engineering (Applicant) | Dashboard, Applications, Compliance, Documents |
| Scrutiny Officer | Dr. A. K. Sharma | Dashboard, Scrutiny Desk, Applications, Documents |
| Regional Officer | Dr. R. K. Singhania (NORTH region) | Dashboard, Applications, Compliance, Scrutiny Desk, EVC Tracking, Audit & Reports |
| Bureau Officer | Shri Vikram Malhotra (CENTRAL region) | Same tabs as Regional Officer |
| EVC Coordinator | Prof. Ramesh Rao | Dashboard, EVC Tracking, Applications, Reports |
| EVC Member | Dr. Sunita Verma | Dashboard, EVC Tracking, Applications, Reports |
| Committee Member | (no screen shown yet) | Applications, Reports |
| Authority | (no screen shown yet) | Applications, Reports, Statutory Sign-Off |
| Administrator | (no screen shown yet) | Rules admin, users, audit |

### 1.2 Screens seen

1. **Institution dashboard.** Cards: My Applications, Open Deficiencies, Compliance Due (8 statutory mandates), Document Vault (Verified). Banner "Next Required Action". Empty state with "Create First Application". Button "New Approval Application".
2. **Applications / Approval Pipeline Tracker.** Cards: Total, Pending, Approved (with approval rate), Rejected. Pipeline stages bar (Submitted, Under Review, Committee, Approved with counts and percentages). Filter chips: ALL, SUBMITTED, UNDER REVIEW, COMMITTEE, APPROVED, REJECTED. Search box, Export CSV, New Application. Table columns: Application ID, Institution, Type, Submitted, Status, Actions (View Details). Side panel: Recent Activity feed with "View Full Audit Log".
3. **Application detail modal.** Header: case ID, status chip, type (New Approval / Renewal / Extension), institution, region (city), academic year, submitted date. Tabs: Overview & Scrutiny, Deficiencies (n), EVC Committee, Audit Timeline, Statutory Final Decision. Workflow progression with four steps: 1. Intake & Filing, 2. Technical Scrutiny, 3. EVC / Committee, 4. Final Decision. "Next Regulatory Action" text with stage-specific buttons. Cards: Current Stage with reviewer, Deficiencies Outstanding with "Resolution timeline: 14 business days from notice". Bottom buttons: Manage Deficiencies, Schedule EVC Inspection, Audit Timeline, Statutory Sign-Off.
4. **Scrutiny & Deficiency Desk.** Cards: Queued for Scrutiny (average turnaround), Active Deficiencies, Rectified Deficiencies. "Scrutiny Casework Queue" with note "Mandatory dual-scrutiny protocol active". Table: Application ID, Institution, Assigned Officer, Deficiencies, Status, Actions (Conduct Scrutiny). "All Active Deficiency Dispatches" list: deficiency ID, category tag, text, deadline, required action, status (Open or Resubmitted), button "Verify & Clear".
5. **Regional / Bureau Command Desk.** Jurisdiction badge. Cards: Regional Queue, Unassigned Work (SLA: 48h allocation target), Active In-Progress, Deadlines & Escalations (active alerts). "Regional Caseload Registry" table: Case ID, Institution, Approval Stream, Stage, Assigned Officer, Status, Review. Button "Full Regional Intake Queue".
6. **EVC Tracking.** Cards: Scheduled Inspections (next 14 days), Panel Pool Available (empanelled senior academicians), Pending Committee Hearings (SHC). "Active EVC Inspections & Assignments" table: Application ID, Institution, Scheduled Date, Assigned Expert Panel, Status, Manage EVC. Coordinator view has an "EVC Calendar" button. Member view: download verification checklists and submit observation reports.

### 1.3 Seed records visible in the video

| Case ID | Institution | Region | Type | Submitted | Status | Notes |
|---|---|---|---|---|---|---|
| AICTE/2026/APP-1042 | Sunrise Institute of Technology | Western (Mumbai) | New Approval | 2026-06-15 | Under Review | Scrutiny stage, reviewer Rajeshwari Nair, deficiency DEF-1042-01 (Faculty): cadre shortfall of 2 Associate Professors in Computer Science, deadline 2026-07-02, action "submit certified recruitment notifications or approved selection board roster" |
| AICTE/2026/APP-1038 | Greenfield College of Engineering | Northern (Kanpur) | Renewal | 2026-06-10 | Committee | Committee Hearing, Standing Hearing Committee Batch B, 0 deficiencies, EVC 2026-06-25, panel Prof. H. R. Venkatesh (IITD), Dr. Sunita Sen (NITK) |
| AICTE/2026/APP-1035 | St. Xavier's Technical Campus | Western (Mumbai) | New Approval | 2026-06-05 | Approved | |
| AICTE/2026/APP-1029 | National Institute of Skill Development | Northern (Lucknow) | Extension | 2026-05-28 | Rejected | Rejected by committee for an unaddressed land norms deficit. DEF-1029-01 (Infrastructure): non-contiguous land parcel, action "provide municipal NOC or consolidation title deed", deadline 2026-06-16, status Open |
| AICTE/2026/APP-1022 | Rural Engineering College | South-West (Bengaluru) | New Approval | 2026-05-20 | Submitted | Pending queue assignment |
| AICTE/2026/APP-1018 | Metropolitan Institute of Management | Central (Bhopal) | Renewal | 2026-05-12 | Under Review | Assigned to Dr. Ananya Sharma, Financial & Legal deficiency: endowment fund FDR lien certificate missing registration stamp, status Resubmitted |
| AICTE/2026/APP-1010 | Coastal Polytechnic | Southern (Chennai) | New Approval | 2026-04-30 | Approved | |
| AICTE/2026/APP-1005 | Hilltop College of Engineering | North-West (Chandigarh) | Extension | 2026-04-22 | Committee | Executive Committee Expert Panel, EVC 2026-06-29, panel empanelment in progress |

---

## 2. The process, step by step

Four statutory stages, shown in the UI as a progress bar.

```
1. Intake & Filing  ->  2. Technical Scrutiny  ->  3. EVC / Committee  ->  4. Final Decision
   (SUBMITTED)          (UNDER_REVIEW)             (COMMITTEE)             (APPROVED / REJECTED)
```

### Step 1: Intake and filing (Institution, Regional or Bureau Officer)

1. Institution registers (new institutions apply for LOA, existing ones for EOA).
2. Institution clicks **New Approval Application**, chooses the type (New Approval, Renewal, Extension), fills the form (the InstitutionInputSnapshot), uploads documents, and optionally adds the faculty roster.
3. **Self-check (SETU):** the institution can run the rule engine in preview mode before submitting. It shows red and green flags with how to fix them. The preview never changes the application.
4. On submit the application becomes `SUBMITTED`, a case ID is generated (`AICTE/<year>/APP-<number>`), a snapshot is frozen, and an audit event is written.
5. Regional or Bureau Officer sees it in the intake queue and assigns it to a Scrutiny Officer within **48 hours** (SLA). Assignment moves it to `UNDER_REVIEW`.

### Step 2: Technical scrutiny (Scrutiny Officer)

1. Officer opens **Conduct Scrutiny**. The system has already run compliance checks, document checks, and fraud flags, so the officer sees flagged items first (SETU).
2. The officer verifies infrastructure and faculty norms. Possible actions:
   - **Raise deficiency:** category (Faculty, Infrastructure, Financial & Legal, and others), description, rule reference, required action, deadline (14 business days from notice).
   - **Verify & Clear:** after the institution resubmits, the officer checks the evidence and marks the deficiency cleared.
   - **Order EVC Visit:** moves the case to the committee stage with an inspection.
   - **Fast-Track Decision:** moves the case straight to the hearing without an EVC visit. Allowed only when policy permits it (for example risk GREEN), and it requires a written reason.
3. **Dual-scrutiny protocol:** two reviewers must confirm before a case leaves scrutiny. Implement as: first reviewer recommends, second reviewer confirms, and both are recorded in the audit log.
4. Deficiency lifecycle: `OPEN` then `RESUBMITTED` (institution uploads evidence) then `CLEARED` (officer verifies).

### Step 3: EVC and committee (EVC Coordinator, EVC Member, Committee Member)

1. EVC Coordinator schedules the inspection and assigns a panel from the empanelled pool. The status shows "Panel empanelment in progress" until the panel is set.
2. EVC Member downloads the verification checklist, visits (physical or virtual), captures geo-tagged evidence, and submits an observation report.
3. The case goes to a committee hearing (Standing Hearing Committee, or Executive Committee Expert Panel). The Committee Member reviews the inspection report and the application summary, then clicks **Submit Recommendation**.

### Step 4: Final decision (Authority)

1. Authority reviews the recommendation and clicks **Statutory Sign-Off**, which sets the case to `APPROVED` or `REJECTED` with a recorded reason or order.
2. The system issues the approval record (certificate with a QR code for verification) or a rejection order. Mark all generated documents "Prototype, not an official document".
3. After approval, **continuous monitoring (SETU)** keeps checking: faculty drift, certificate expiries, and alerts.

---

## 3. Status model

Two fields: a coarse `status` for filters and counts, and a `stage_detail` for the label.

```
status:        SUBMITTED | UNDER_REVIEW | COMMITTEE | APPROVED | REJECTED
stage_detail:  INTAKE | TECHNICAL_SCRUTINY | EVC_VISIT | COMMITTEE_HEARING | FINAL_DECISION
```

Allowed transitions (anything else returns HTTP 409):

| From | To | Who | Condition |
|---|---|---|---|
| (new) | SUBMITTED | Institution | Snapshot saved, required fields present |
| SUBMITTED | UNDER_REVIEW | Regional or Bureau Officer | Scrutiny Officer assigned |
| UNDER_REVIEW | UNDER_REVIEW | Scrutiny Officer, Institution | Deficiency raised, resubmitted, or cleared |
| UNDER_REVIEW | COMMITTEE (EVC_VISIT) | Scrutiny Officer | Dual-scrutiny done, Order EVC Visit |
| UNDER_REVIEW | COMMITTEE (COMMITTEE_HEARING) | Scrutiny Officer | Fast-Track allowed by policy, reason given |
| COMMITTEE (EVC_VISIT) | COMMITTEE (COMMITTEE_HEARING) | EVC Coordinator | Observation report submitted |
| COMMITTEE | APPROVED or REJECTED | Authority | Recommendation recorded, Statutory Sign-Off |

Every transition writes an audit event (who, from, to, reason, timestamp) and updates `stage_started_at` and `due_at`.

---

## 4. SLA rules

| Rule | Value | Source |
|---|---|---|
| Allocation of a new application to a scrutiny officer | 48 hours | Shown in UI |
| Institution response to a deficiency | 14 business days from notice | Shown in UI |
| Scrutiny review per case | 7 days (configurable) | Assumption, make it a config value |
| EVC report submission | 5 days after the visit (configurable) | Assumption |
| Committee recommendation | 10 days (configurable) | Assumption |

Status function:

```python
def sla_status(started_at, due_at, now):
    used = (now - started_at) / (due_at - started_at)
    return "ESCALATED" if used >= 1 else "WARNING" if used >= 0.7 else "ON_TRACK"
```

- WARNING creates a notification for the current owner.
- ESCALATED creates an alert on the Regional or Bureau Officer's "Deadlines & Escalations" card (the count is computed, not typed).
- Use one simulated clock setting so demo timers are repeatable.

---

## 5. Permissions (scoped RBAC)

| Action | Inst. | Scrutiny | Regional | Bureau | EVC Coord. | EVC Mem. | Committee | Authority | Admin |
|---|---|---|---|---|---|---|---|---|---|
| Create and submit application | own | | | | | | | | |
| See applications | own only | assigned | own region | own region | assigned | assigned | assigned | all | all |
| Assign scrutiny officer | | | yes | yes | | | | | |
| Raise or clear deficiency | respond only | yes | | | | | | | |
| Order EVC visit, fast-track | | yes | | | | | | | |
| Schedule EVC, assign panel | | | | | yes | | | | |
| Submit observation report | | | | | | yes | | | |
| Submit recommendation | | | | | | | yes | | |
| Statutory sign-off | | | | | | | | yes | |
| Edit rules, SLA, dependency map | | | | | | | | | yes |
| Read audit log | own | assigned | region | region | assigned | assigned | assigned | all | all |

Region and institution scoping is enforced in the backend query, not in the UI.

---

## 6. SETU intelligence layer: where each feature plugs into the existing screens

| SETU feature | Where it appears | Backend |
|---|---|---|
| Self-check (rule preview) | Institution, Compliance tab and New Application wizard | `POST /compliance/check` (preview mode) |
| Deficiency matrix | Application modal, Overview & Scrutiny and Deficiencies tabs | rule engine results |
| Document viewer with extracted values | Documents tab and the Deficiencies tab (split view: PDF left, extracted vs declared right) | `GET /applications/{id}/documents`, `GET /documents/{id}/file`, `GET /documents/{id}/evidence` |
| Ghost faculty and duplicate-document flags | Scrutiny Desk (flag chips on queue rows) and Audit & Reports | faculty overlap audit, file hash check |
| Risk level (GREEN, AMBER, RED) | Badge on queue rows and application header | `GET /applications/{id}/risk` |
| **Impact Radar** | New tab "Impact Radar" in the application modal, plus a card on the Regional Command Desk | `GET /applications/{id}/impact` |
| SLA badge and escalations | Column on tables, the Deadlines & Escalations card | `sla` field on applications |
| Faculty drift monitor | Institution Compliance tab, and an alert list for Regional and Bureau Officers | `GET /institutions/{id}/faculty-trend` |
| Bottleneck view (many files stuck on one cause) | Bureau Officer dashboard | `GET /analytics/bottlenecks` |
| Hash-chained audit log | Audit Timeline tab and Audit & Reports | audit service |

### 6.1 Rule engine

Six rule groups evaluated from the snapshot: faculty-student ratio and cadre, built-up area, computing facilities, library, safety and accessibility, statutory committees. Each result returns: rule id, required, actual, status (COMPLIANT or DEFICIENT), shortfall, severity, explanation, and the handbook clause. Rules and thresholds live in a table or config, versioned and effective-dated.

### 6.2 Document checks

1. Store the file, compute SHA-256, and check for an identical file already submitted.
2. Read text with pdfplumber (OCR only for scans).
3. Extract fields (certificate number, valid-from, valid-to) and compare with the declared values.
4. Check PDF metadata (for example producer is an image editor).
5. Return `NEEDS_REVIEW` when the file can't be read or values mismatch. Never return VERIFIED for a file that wasn't read.

### 6.3 Faculty drift

For each of the last 12 month-ends: count faculty where `joined <= month_end` and (`left is null` or `left > month_end`), compute student-faculty ratio, and flag months below the rule threshold. Also flag guest faculty added within 30 days before an application or visit and gone within 90 days after. Flags are advisory.

### 6.4 Impact Radar

- Store a small dependency map as config (nodes are issues, rules, stages; edges are `blocks`, `affects`, `requires`).
- For one application, take all open issues and find the stages each one touches (graph descendants).
- Score = severity x stage importance x number of things it unblocks x urgency (time left on the SLA). Weights come from config.
- Group issues that share a root cause so one action can resolve several.
- Output per recommendation: action, order, affected stages, rule, evidence, confidence. AI may phrase the explanation but cannot add facts.
- The officer can Accept, Dismiss with a reason, or Override; all are logged.

Starter map (confirm each edge against the handbook):

```
FACULTY_VERIFICATION -> FSR_RULE -> EVC_VISIT -> COMMITTEE_HEARING
FSR_RULE -> INTAKE_DECISION
FIRE_NOC -> FINAL_DECISION
```

### 6.5 Audit log

Every action writes an event with `prev_hash` and `hash` (hash of the previous hash plus the event content). Provide a verify function that walks the chain and reports the first broken link.

---

## 7. Data model (add to the existing models; do not rename existing ones)

| Entity | Fields to have |
|---|---|
| Institution | code, name, region, city, programme type |
| User | role, name, institution_id (if institution), region (if officer) |
| Application | case_id (`AICTE/<year>/APP-<n>`), institution_id, type (NEW, RENEWAL, EXTENSION), academic_year, status, stage_detail, assigned_officer_id, region, stage_started_at, due_at, payload_snapshot (JSON), submitted_at |
| ApplicationRevision | application_id, snapshot, created_at, reason |
| Deficiency | id (`DEF-<app>-<nn>`), application_id, category, description, rule_id, handbook_clause, required_action, deadline, status (OPEN, RESUBMITTED, CLEARED), raised_by, cleared_by |
| ComplianceRun and Result | application_id, run time, per-rule required, actual, status, shortfall, explanation |
| FacultyMember | institution_id, name, pan_hash, designation, employment_type (REGULAR, GUEST), joined_date (Date), left_date (Date, nullable) |
| DocumentVerification | application_id, type, file path, file_hash, extracted_json, comparison_json, flags, confidence, status (EXTRACTED, NEEDS_REVIEW, FLAGGED) |
| EvcInspection | application_id, scheduled_date, mode (PHYSICAL, VIRTUAL), panel members, checklist, report, status |
| Recommendation | application_id, committee, member_id, text, created_at |
| Decision | application_id, authority_id, outcome, reason, signed_at |
| Notification | user_id, application_id, level, message, read |
| AuditEvent | actor, action, application_id, from, to, reason, prev_hash, hash, created_at |

Case ID, deficiency ID, counts, and percentages are generated or computed, never hand-typed.

---

## 8. API (proposed; reuse existing route names where they already exist)

| Screen | Endpoint |
|---|---|
| Login / role switch | `POST /auth/login`, `GET /auth/demo-token/{role}` (demo only) |
| Institution dashboard cards | `GET /institutions/me/summary` |
| Applications list with filters, search, CSV | `GET /applications?status=&q=&page=&format=csv` |
| Application detail | `GET /applications/{id}` (includes sla, risk, stage_detail) |
| Create and submit | `POST /applications`, `POST /applications/{id}/submit` |
| Self-check | `POST /compliance/check` |
| Assign officer | `POST /applications/{id}/assign` |
| Deficiencies | `POST /applications/{id}/deficiencies`, `POST /deficiencies/{id}/resubmit`, `POST /deficiencies/{id}/clear` |
| Stage actions | `POST /applications/{id}/transition` with action = ORDER_EVC, FAST_TRACK, RECOMMEND, SIGN_OFF |
| EVC | `GET /evc/inspections`, `POST /evc/inspections`, `POST /evc/inspections/{id}/report` |
| Scrutiny desk cards | `GET /scrutiny/summary` |
| Regional desk cards | `GET /regions/{region}/summary` |
| Audit | `GET /applications/{id}/audit`, `GET /audit/verify` |
| Activity feed | `GET /activity?limit=` |
| SETU | `GET /applications/{id}/risk`, `/impact`, `/documents`, `GET /institutions/{id}/faculty-trend`, `GET /analytics/bottlenecks` |
| Demo | `POST /demo/reset`, `POST /demo/advance-clock?days=` |

---

## 9. Seed and demo data

- Recreate the eight applications in section 1.3 so the UI and backend match.
  - **AICTE/2026/APP-1042 Sunrise** (Hero case)
  - **AICTE/2026/APP-1038 Greenfield** (Clean case)
  - **AICTE/2026/APP-1035 St. Xavier's**
  - **AICTE/2026/APP-1029 National Institute of Skill Development** (Rejection)
  - **AICTE/2026/APP-1022 Rural** (Unassigned queue, 48h SLA warning)
  - **AICTE/2026/APP-1018 Metropolitan** (Document mismatch, resubmitted)
  - **AICTE/2026/APP-1010 Coastal Polytechnic**
  - **AICTE/2026/APP-1005 Hilltop College** (EVC panel empanelment in progress)
- Plus Delhi Institute of Engineering (Applicant login).

---

## 10. Issues spotted in the demo video (fix before the final recording)

1. Scope leak: logged in as Institution (Delhi Institute of Engineering), only see own applications.
2. Pagination text: "Showing X of Y • Page 1 of Z" computed dynamically from actual count.
3. Remove unverified "Statutory benchmark 85%".
4. Replace unverified clause citation with real handbook reference or sample data label.
5. Bureau Officer screen titled "Bureau Officer Command Desk" (not Regional Officer).
6. Branding: "AICTE FlowGuard • Regulatory Approval & Statutory Compliance System (Standalone Presentation Mode)" and "Prototype, not an official AICTE system".
7. All counts computed: pipeline percentages, approval rate, "Deadlines & Escalations: 4", "Queued for scrutiny: 3", "Average turnaround 3.2 days".

---

## 11. Honest labelling for the video and submission

| Working (real logic) | Simulated | Roadmap |
|---|---|---|
| Rule engine, workflow transitions, RBAC, audit log, overlap check, document reading of sample PDFs, drift calculation, SLA status, Impact Radar ranking | Document OCR beyond sample digital PDFs, simulated clock, demo tokens, seeded institutions | Registry and payroll verification, DigiLocker, SMS or WhatsApp, learned risk model, QR certificate signing, real portal integration |
