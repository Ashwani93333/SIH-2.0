# pwd.md — Project Working Document

**Project:** AICTE Compliance & Approval Support System (ACAS) — *working name*
**Created:** 24 Oct 2026 · **Owner:** Team lead _(fill in)_
**Companion files:** `prd.md` (what to build) · `readme.md` (repo front page)

> The PRD is the spec. **This file is the plan, task list, status and decisions.** Update it every day.

---

## 1. One-minute understanding (everyone must be able to say this)

> ACAS helps AICTE officers verify colleges, prioritise scrutiny and keep monitoring after approval. **Rules find gaps. AI reads evidence. Risk scoring prioritises. Humans decide.**

**Flow to remember:**
`Application → 3-layer verification → Report → Risk → Officer scrutiny → Human decision + tracking → Post-approval monitoring`

**Three layers:**
1. **Rule engine:** numbers and dates against configurable rules.
2. **Document AI:** read Fire NOC → compare with declared date.
3. **Cross-record validation:** duplicate PAN, odd employment patterns.

**Things we never say:**
- ❌ "AICTE has no digital system" (the handbook describes an online portal and online scrutiny).
- ❌ "Our AI approves/rejects colleges."
- ❌ "Duplicate PAN proves ghost faculty."
- ❌ "Our ratio/thresholds are the official AICTE ones" (they are demo settings unless taken from the handbook).

---

## 2. Immediate decisions (do these today)

| # | Decision | Owner | Status |
|---|---|---|---|
| 1 | **Which problem statement is our primary submission?** (SIH26262 workflow/alerts, SIH26261 AI validation, or the one that matches your portal selection.) Map the pitch to that statement's evaluation criteria. | Lead | ⬜ |
| 2 | Confirm the **real deadline and submission template** with college SPOC and on https://www.sih.gov.in/sih2026PS. (An unofficial mirror listed 28 Oct 2026 — not verified.) | Lead | ⬜ |
| 3 | Pick team roles (see §3) | Lead | ⬜ |
| 4 | Product name | Team | ⬜ |
| 5 | LLM/OCR choice for Document AI (local Tesseract vs API) | Backend/AI | ⬜ |

---

## 3. Team & tracks

| Track | Owner | Scope |
|---|---|---|
| **A. Rules & data** | _name_ | Rulebook, rule engine, DB schema, synthetic data |
| **B. Backend & workflow** | _name_ | FastAPI, auth/RBAC, state machine, SLA jobs, audit |
| **C. AI & verification** | _name_ | Document AI, duplicate detection, drift monitor, risk score |
| **D. Frontend** | _name_ | Next.js portals, dashboards, report/case views |
| **E. Pitch & research** | _name_ | Deck, APH evidence, Q&A, demo script, QA of claims |

With fewer people, merge A+B and C+E. Frontend works from **mock data** until APIs exist.

---

## 4. Priority levels (don't skip order)

| Level | Items |
|---|---|
| **L1 Core — must** | Rule engine, document upload/verification support, compliance & deficiency report, workflow + deadlines + audit history |
| **L2 USP** | Faculty drift monitor, ghost-faculty (duplicate) detection, evidence-based risk score, Document AI |
| **L3 Extras** | College scorecard, deficiency PDF, inspection photo upload, QR demo certificate, tamper-evident audit + heatmap |

Rule: **L2 features must attach to the same application record and report as L1.** No disconnected tools.

---

## 5. Phase plan

> Numbers show **dependencies**, not that everyone works sequentially. After Phase 0, tracks run in parallel.

### Phase 00 — Problem, rules, API contract  *(Foundation)*
**Tasks**
- [ ] Read relevant APH sections (faculty norms, area, labs, certificates, scrutiny/EVC/approval steps).
- [ ] Select the **six** initial rules; write formula, inputs, outputs, source clause (see `prd.md` §7.1).
- [ ] Write the **ABC College** demo scenario and S1–S8 expected outputs (`prd.md` §12).
- [ ] Freeze API contract v1 (`prd.md` §9) — endpoints, request/response JSON.
- [ ] Agree status vocabulary: `PASS / FAIL / MISSING_EVIDENCE / NEEDS_REVIEW`; bands: Green/Amber/Red.

**Done when:** rulebook + ABC scenario + API contract are in `/docs` and approved by everyone.

### Phase 01 — App skeleton
- [ ] Monorepo: `apps/web` (Next.js), `apps/api` (FastAPI), `docker-compose.yml`.
- [ ] `.env.example`, linting, formatting, pre-commit.
- [ ] Health endpoint; frontend calls it.
- [ ] CI: lint + tests on push.

**Done when:** `docker compose up` shows a page that fetches data from the API and DB.

### Phase 02 — Database & synthetic data
- [ ] Alembic migrations for tables in `prd.md` §8.
- [ ] Seed script: ≥ 10 colleges, faculty rosters with join/leave dates, student counts, certificates.
- [ ] Planted cases for S1–S8 (clean, shortfall, NOC mismatch, duplicate PAN, drift, combined, unreadable, SLA breach).
- [ ] Prepare 3–5 sample Fire NOC PDFs (synthetic; vary layout, include one blurry).

**Done when:** `npm run seed` / `python -m app.seed` yields reproducible data for every scenario.

### Phase 03 — Rule engine  *(L1)*
- [ ] Rule config loader (DB-backed, versioned).
- [ ] Implement six rules; each returns required/actual/shortfall/status/explanation.
- [ ] Unit tests with hand-calculated cases (include ABC: 600 students, 25 faculty → required 30, shortfall 5 under demo ratio).
- [ ] Admin endpoint to edit parameters (audited) → re-run changes result.
- [ ] Store `rule_results` with rule version.

**Done when:** editing the ratio in config changes the report without code changes.

### Phase 04 — Document & cross-record verification  *(L2)*
- [ ] Upload + checksum + versioning.
- [ ] OCR + Fire NOC expiry extraction + schema validation + confidence.
- [ ] Compare with declared date → MATCH / MISMATCH / LOW_CONFIDENCE / UNREADABLE.
- [ ] Duplicate-ID detection with overlap vs sequential classification.
- [ ] Employment pattern checks (short tenure, burst join/leave near event dates).
- [ ] Unified report endpoint combining rules + documents + flags with evidence.

**Done when:** `GET /applications/{id}/report` shows all three layers for ABC College with evidence links.

### Phase 05 — Risk scoring & workflow  *(L1 workflow, L2 risk)*
- [ ] Risk scorer: configurable weights, confidence-aware, top reasons.
- [ ] State machine with role-based transitions; illegal → 409 + log.
- [ ] Tasks, due dates, SLA settings, clock owner (pause/resume on return for correction).
- [ ] SLA monitor job: warn → overdue → escalate; de-duplicated notifications.
- [ ] Decision gate: only Competent Authority can record LoA/LoD/LoR.
- [ ] Officer dashboard: risk list + due/overdue.

**Done when:** simulated time triggers warning, overdue and escalation for S8; a non-authority role cannot record a decision.

### Phase 06 — Continuous faculty monitoring  *(L2, main USP)*
- [ ] Monthly snapshot builder from join/leave dates.
- [ ] Required vs actual per month; alerts (BELOW_REQUIREMENT, CHURN_NEAR_EVENT, SHORT_TENURE_CLUSTER, EVENT_ONLY_PRESENCE, CERT_EXPIRING).
- [ ] Scheduled job + manual "run now".
- [ ] Timeline chart with event markers (application, inspection, approval).

**Done when:** S5 shows both drift alerts on a timeline, each linking to its records.

### Phase 07 — Supporting features  *(L3, only if L1+L2 stable)*
- [ ] Deficiency matrix PDF
- [ ] Inspection photo/evidence upload
- [ ] College compliance scorecard
- [ ] QR-verifiable **demo** certificate (labelled prototype)
- [ ] Hash-chained audit log + "Verify chain"
- [ ] Bureau heatmap

### Phase 08 — Test, polish, demo
- [ ] Automated tests for S1–S8
- [ ] Failure handling: OCR failure, LLM invalid JSON, job crash/restart
- [ ] Accessibility and error-state pass
- [ ] Demo script rehearsed twice; **backup demo video recorded**
- [ ] Final copy check: disclaimers present, no overclaims

---

## 6. Suggested timeline

**Stage A — Idea submission (deadline to be confirmed; mirror says 28 Oct)**

| Day | Focus | Output |
|---|---|---|
| Sat 24 Oct | Decisions (§2), read APH, split roles | Chosen statement, role split, rule shortlist |
| Sun 25 Oct | Architecture + workflow diagrams, mock screens (dashboard, report, drift timeline) | Diagrams, 3 mock screens |
| Mon 26 Oct | Deck draft + evidence slide + Q&A prep | Full draft |
| Tue 27 Oct | Review, polish, rehearse | Final deck |
| Wed 28 Oct | **Submit early; keep buffer** | Submission done |

If the real deadline is earlier, drop mock screens to two and skip rehearsal polish — but never skip the claims check (§9).

**Stage B — Prototype build (if shortlisted)**
Run Phases 00→08 in ~3–4 weeks: wk 1 (00–02), wk 2 (03–05), wk 3 (06–07), wk 4 (08). Adjust to the actual hackathon schedule.

---

## 7. Working agreements

**Git**
- `main` always runs. Work on `feat/<track>-<name>`; PRs reviewed by one other person.
- Conventional commits (`feat:`, `fix:`, `docs:`, `test:`).

**Code**
- Backend: Pydantic models for every request/response; no business logic in route handlers.
- Rule/scoring code is **pure functions** with unit tests.
- Frontend never calculates compliance; it renders what the API returns.
- Every config value lives in DB/config with a version.

**Definition of Done (per task)**
- [ ] Works on seeded data (docker compose)
- [ ] Unit tests added/updated and passing
- [ ] Output shows evidence/explanation (no bare colours/flags)
- [ ] Audit event written where state changes
- [ ] Disclaimer text present where output is advisory
- [ ] Docs/readme updated

**Daily stand-up (10 min)**
```
Done yesterday:
Doing today:
Blocked on:
Deadline risk (green/amber/red):
```

---

## 8. Assumptions to verify

| # | Assumption | How to verify |
|---|---|---|
| 1 | Faculty ratio, cadre, area, lab norms from APH by programme | Read APH tables; record clause numbers |
| 2 | Fire NOC layout/fields | Collect 2–3 public sample NOCs |
| 3 | Real AICTE portal capabilities | Review APH + portal docs; talk to a college admin contact |
| 4 | Officer roles & authority matrix | APH + 1 conversation if possible |
| 5 | SLA durations | Treat as internal demo settings; do not present as statutory |
| 6 | Notification channels | Email/in-app only for prototype |

---

## 9. Claims checklist before any submission/demo

- [ ] We say the portal is already digital; we add verification, cross-checking, prioritisation, tracking.
- [ ] Ratios/thresholds/weights/SLAs are labelled **illustrative** unless from the APH.
- [ ] No "automatically approves/rejects" anywhere (slides, UI, README).
- [ ] Duplicate PAN/drift language says "signal for investigation".
- [ ] AI described as *extracting and flagging*, not certifying authenticity.
- [ ] Accuracy numbers are from a real test set we can show.
- [ ] Synthetic data stated clearly.

---

## 10. Pitch outline (maps to `prd.md`)

1. Intro — support, not replace
2. Existing workflow (portal, scrutiny, EVC, committee, LoA/LoD/LoR)
3. Problems we address (5 areas)
4. Solution — three verification layers
5. Risk assessment & workflow tracking
6. Key differentiator — continuous faculty monitoring + connected flags
7. Technical implementation
8. Expected outcome / demo

**One story:** ABC College → shortfall + NOC mismatch + duplicate PAN → Red with reasons → officer review → tracked decision → post-approval drift alert.

---

## 11. Jury Q&A prep (short answers)

| Question | Answer in one line |
|---|---|
| Problem? | Gap between collecting data and systematically verifying, cross-checking and monitoring it |
| Unique? | Time-based faculty monitoring connected with document checks and evidence-based prioritisation |
| Why AI? | Rules for exact checks, AI only to read unstructured documents, queries for inconsistency |
| Ghost faculty? | Duplicate IDs + employment patterns → flags for human investigation |
| AI reads wrong date? | Side-by-side display, confidence, low-confidence → officer check |
| Auto approve? | No; competent authority decides |
| How tested? | Synthetic colleges with known planted cases and expected outputs |
| After approval? | Drift monitor alerts for review, no automatic violation claim |
| Not just a dashboard? | Evaluates rules, extracts, cross-checks, explains, tracks next action |
| Why when AICTE has a portal? | We add integrated verification, anomaly detection, prioritisation and tracking on top |

---

## 12. Risks & backup plan

| Risk | Mitigation | Owner |
|---|---|---|
| Wrong deadline | Confirm with SPOC today | Lead |
| Too many features | Freeze at L1+L2 until stable | Lead |
| OCR/LLM flaky in demo | Cached extraction results + pre-recorded video | AI |
| Rule numbers challenged | Show clause refs; "illustrative" labels | Rules |
| Integration slip | Mock API early; contract frozen in Phase 00 | Backend/Frontend |
| Last-day portal issues | Submit a day early | Lead |

---

## 13. Decision log

| # | Date | Decision | Why |
|---|---|---|---|
| 1 | 24 Oct | Human officers keep final authority; output advisory | Core safeguard |
| 2 | 24 Oct | Stack: Next.js, FastAPI, PostgreSQL, Redis | Team workflow document |
| 3 | 24 Oct | Synthetic data only | Privacy; reproducible tests |
| 4 | | Primary problem statement: _fill in_ | |
| 5 | | OCR/LLM choice: _fill in_ | |

---

## 14. Links
- Problem statements: https://www.sih.gov.in/sih2026PS
- APH 2024-25 to 2026-27: https://aicte.gov.in/sites/default/files/APH%20Final.pdf
- Repo: _add_ · Design: _add_ · Deck: _add_ · Demo video: _add_
