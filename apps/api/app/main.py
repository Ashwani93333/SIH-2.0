from fastapi import FastAPI, HTTPException, status, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import copy
import os
import io
import csv
from datetime import datetime, timedelta

from app.rules.engine import run_all_rules, evaluate_fsr
from app.documents.extractor import compare_fire_noc
from app.crossrecord.duplicates import detect_faculty_duplicates
from app.monitoring.drift import calculate_monthly_snapshots
from app.risk.scorer import calculate_risk_score
from app.workflow.state_machine import can_transition, calculate_sla_status
from app.audit.logger import audit_store
from app.impact.radar import compute_impact_radar
from app.seed.loader import load_all_scenarios

app = FastAPI(
    title="AICTE FlowGuard • Regulatory Approval & Statutory Compliance System",
    description="Statutory Compliance, AI-Assisted Verification & Approval Automation Layer (Standalone Presentation Mode)",
    version="1.2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory working store seeded from canonical scenarios
SCENARIOS_STORE = load_all_scenarios()
APP_STATE: Dict[str, Any] = copy.deepcopy(SCENARIOS_STORE)
GLOBAL_CONFIG = {
    "students_per_faculty": 20,
    "simulated_days": 0,
    "current_date": "2026-06-20"
}

# --- Pydantic Request Models ---
class TransitionRequest(BaseModel):
    target_state: str
    role: str
    actor: str = "Dr. A. K. Sharma"
    reason: Optional[str] = "Statutory procedural transition"
    action: Optional[str] = None  # ORDER_EVC, FAST_TRACK, RECOMMEND, SIGN_OFF

class DecisionRequest(BaseModel):
    decision_type: str  # "LOA_ISSUED", "LOD_ISSUED", "LOR_ISSUED", "APPROVED", "REJECTED"
    role: str
    authority_name: str = "Prof. Rajive Kumar, Member Secretary"
    note: str

class FlagReviewRequest(BaseModel):
    action: str  # "Reviewed - Explained", "Reviewed - Escalate", "Dismissed"
    role: str = "Scrutiny Officer"
    officer_name: str = "Dr. A. K. Sharma"
    note: str

class ExtractionOverrideRequest(BaseModel):
    overridden_value: str
    role: str = "Scrutiny Officer"
    officer_name: str = "Dr. A. K. Sharma"
    reason: str

class ConfigUpdateRequest(BaseModel):
    students_per_faculty: Optional[int] = None
    simulated_days: Optional[int] = None

class CreateApplicationRequest(BaseModel):
    college_name: str
    app_type: str = "New Approval"
    region: str = "Northern (Kanpur)"
    programme: str = "Engineering & Technology (UG)"
    students: int = 600
    faculty_count: int = 28
    land_acres: float = 4.5
    built_up_sqm: float = 8500.0
    declared_labs: int = 20
    fire_noc_expiry: str = "2027-10-31"
    academic_year: str = "2026-2027"
    institution_id: Optional[str] = "INST-DELHI-001"

class AssignOfficerRequest(BaseModel):
    officer_name: str = "Dr. A. K. Sharma"
    second_reviewer_name: Optional[str] = "Dr. R. K. Singhania"
    role: str = "Regional Officer"

class RaiseDeficiencyRequest(BaseModel):
    category: str = "Faculty"
    description: str
    rule_id: str = "CAD-002"
    handbook_clause: str = "AICTE APH 2024-27 Appendix 7.2"
    required_action: str
    deadline_days: int = 14
    role: str = "Scrutiny Officer"
    raised_by: str = "Dr. A. K. Sharma"

class ResubmitDeficiencyRequest(BaseModel):
    evidence_filename: str
    explanation: str
    role: str = "Institution"

class ClearDeficiencyRequest(BaseModel):
    officer_name: str = "Dr. A. K. Sharma"
    notes: str = "Verification documents reviewed and found compliant with statutory norms."
    role: str = "Scrutiny Officer"

class SelfCheckRequest(BaseModel):
    students: int = 600
    faculty_count: int = 25
    land_acres: float = 4.5
    built_up_sqm: float = 8500.0
    declared_labs: int = 20
    fire_noc_expiry: str = "2027-12-31"
    programme: str = "Engineering & Technology (UG)"

class EvcScheduleRequest(BaseModel):
    scheduled_date: str = "2026-07-05"
    mode: str = "PHYSICAL"
    panel_members: List[str] = ["Prof. H. R. Venkatesh (IITD)", "Dr. Sunita Sen (NITK)"]
    notes: Optional[str] = "Physical infrastructure and laboratory inspection mandated."
    role: str = "EVC Coordinator"

class EvcReportRequest(BaseModel):
    status: str = "RECOMMENDED_FOR_APPROVAL"  # "RECOMMENDED_FOR_APPROVAL", "DEFICIENT", "REJECTED"
    report_notes: str
    member_name: str = "Dr. Sunita Verma"
    role: str = "EVC Member"

class RecommendationRequest(BaseModel):
    recommendation: str = "GRANT_APPROVAL"  # "GRANT_APPROVAL", "REFUSE_APPROVAL"
    member_name: str = "Prof. H. R. Venkatesh"
    notes: str
    role: str = "Committee Member"

class AdvanceClockRequest(BaseModel):
    days: int = 1

# --- Helpers ---
def get_canonical_apps_list() -> List[Dict[str, Any]]:
    """Returns unique list of applications without duplicate alias keys."""
    seen_ids = set()
    apps = []
    for key, data in APP_STATE.items():
        case_id = data.get("id") or data.get("case_id")
        if case_id and case_id not in seen_ids:
            seen_ids.add(case_id)
            apps.append(data)
    return apps

def find_application(app_id: str) -> Optional[Dict[str, Any]]:
    clean_id = app_id.strip()
    if clean_id in APP_STATE:
        return APP_STATE[clean_id]
    for key, data in APP_STATE.items():
        if data.get("id") == clean_id or data.get("case_id") == clean_id or key == clean_id:
            return data
        clean_suffix = clean_id.split("/")[-1]
        data_suffix = (data.get("id") or "").split("/")[-1]
        if clean_suffix == data_suffix:
            return data
    return None

def compile_verification(app_data: Dict[str, Any], sim_days: int = 0) -> Dict[str, Any]:
    # 1. Rules
    rule_results = run_all_rules(app_data, {"students_per_faculty": GLOBAL_CONFIG["students_per_faculty"]})

    # 2. Document AI (Fire NOC)
    doc_result = compare_fire_noc(
        declared_expiry=app_data.get("fire_noc_expiry"),
        extracted_expiry=app_data.get("extracted_fire_noc"),
        confidence=app_data.get("doc_confidence", 0.95),
        is_blurry=app_data.get("is_blurry", False)
    )

    # 3. Cross-Record Duplicates
    dup_flags = detect_faculty_duplicates(
        current_college_faculty=app_data.get("faculty", []),
        all_system_faculty=app_data.get("other_system_faculty", []),
        current_college_id=app_data.get("id", "COL-1")
    )

    # Synthesize flags for risk scoring
    risk_flags = []
    deficiencies = list(app_data.get("deficiencies", []))

    for r in rule_results:
        if r["status"] == "FAIL":
            flag_key = "FSR_FAIL" if r["rule_id"] == "FSR-001" else f"{r['rule_id'][:3]}_FAIL"
            risk_flags.append({
                "flag_type": flag_key,
                "title": f"Rule Failure: {r['name']}",
                "severity": r["severity"],
                "confidence": 1.0,
                "explanation": r["explanation"]
            })
        elif r["status"] == "MISSING_EVIDENCE":
            risk_flags.append({
                "flag_type": "MISSING_EVIDENCE",
                "title": f"Missing Evidence: {r['name']}",
                "severity": r["severity"],
                "confidence": 1.0,
                "explanation": r["explanation"]
            })

    if doc_result["status"] == "MISMATCH":
        risk_flags.append({
            "flag_type": "FIRE_NOC_MISMATCH",
            "title": "Fire NOC Expiry Date Mismatch",
            "severity": "HIGH",
            "confidence": doc_result["confidence"],
            "explanation": doc_result["explanation"]
        })
    elif doc_result["status"] == "UNREADABLE":
        risk_flags.append({
            "flag_type": "FIRE_NOC_UNREADABLE",
            "title": "Fire NOC Scan Unreadable",
            "severity": "MEDIUM",
            "confidence": doc_result["confidence"],
            "explanation": doc_result["explanation"]
        })

    for d in dup_flags:
        risk_flags.append({
            "flag_type": d["flag_type"],
            "title": f"Concurrent Faculty Record: {d['faculty_name']}",
            "severity": d["severity"],
            "confidence": 1.0,
            "explanation": d["explanation"]
        })

    # Include existing deficiencies in risk accumulation
    for d in app_data.get("deficiencies", []):
        if d.get("status") in ["OPEN", "RESUBMITTED"]:
            cat = d.get("category", "").upper()
            flag_type = "CADRE_FAIL" if "FACULTY" in cat or "CADRE" in cat else (
                "LAND_FAIL" if "INFRA" in cat or "LAND" in cat else "CERT_EXPIRED"
            )
            risk_flags.append({
                "flag_type": flag_type,
                "title": f"Deficiency: {d.get('description')}",
                "severity": "HIGH",
                "confidence": 1.0,
                "explanation": d.get("required_action")
            })

    # Risk score calculation
    risk = calculate_risk_score(risk_flags)

    # SLA calculation
    effective_sim_days = app_data.get("simulated_days", 0) + sim_days + GLOBAL_CONFIG["simulated_days"]
    state_to_check = app_data.get("status") or app_data.get("state", "UNDER_REVIEW")
    sla = calculate_sla_status(state_to_check, app_data.get("stage_started_at", "2026-06-16"), effective_sim_days)

    # Impact radar calculation
    radar = compute_impact_radar(app_data, sim_days=effective_sim_days)

    return {
        "rule_results": rule_results,
        "document_ai": doc_result,
        "cross_record_flags": dup_flags,
        "deficiency_matrix": deficiencies,
        "risk_assessment": risk,
        "sla": sla,
        "impact_radar": radar
    }

# --- System & Demo Routes ---
@app.get("/health")
def health():
    return {
        "status": "ok",
        "system": "AICTE FlowGuard • Regulatory Architecture",
        "mode": "Standalone Presentation Mode",
        "version": "1.2.0",
        "disclaimer": "Prototype, not an official AICTE system. Simulated data only."
    }

@app.post("/demo/reset")
def reset_demo_state():
    global APP_STATE, GLOBAL_CONFIG
    APP_STATE = copy.deepcopy(SCENARIOS_STORE)
    GLOBAL_CONFIG["simulated_days"] = 0
    
    audit_store.log(
        actor="System Demo Controller",
        role="Administrator",
        action="DEMO_STATE_RESET",
        entity="SYSTEM",
        entity_id="ALL",
        details="All 8 canonical scenarios reset to baseline state."
    )
    return {
        "success": True,
        "message": "Demo state successfully reset to baseline canonical scenarios.",
        "simulated_days": 0,
        "active_records": len(get_canonical_apps_list())
    }

@app.post("/demo/advance-clock")
def advance_simulated_clock(req: AdvanceClockRequest):
    GLOBAL_CONFIG["simulated_days"] += req.days
    audit_store.log(
        actor="Simulation Controller",
        role="Administrator",
        action="SIMULATION_CLOCK_ADVANCED",
        entity="SYSTEM",
        entity_id="TIME",
        details={"advanced_days": req.days, "total_simulated_days": GLOBAL_CONFIG["simulated_days"]}
    )
    return {
        "success": True,
        "simulated_days": GLOBAL_CONFIG["simulated_days"],
        "message": f"Simulated clock advanced by +{req.days} days (Total: +{GLOBAL_CONFIG['simulated_days']} days)."
    }

@app.get("/auth/demo-token/{role}")
def get_demo_auth_profile(role: str):
    """Provides demo profile credentials per §1.1 for role switching."""
    profiles = {
        "Institution": {
            "name": "Delhi Institute of Engineering",
            "role": "Institution",
            "institution_id": "INST-DELHI-001",
            "region": "Northern (Delhi)",
            "navigation": ["Dashboard", "Applications", "Compliance", "Documents"]
        },
        "Scrutiny Officer": {
            "name": "Dr. A. K. Sharma",
            "role": "Scrutiny Officer",
            "institution_id": None,
            "region": "Northern (Kanpur)",
            "navigation": ["Dashboard", "Scrutiny Desk", "Applications", "Documents"]
        },
        "Regional Officer": {
            "name": "Dr. R. K. Singhania",
            "role": "Regional Officer",
            "institution_id": None,
            "region": "Northern (Kanpur)",
            "navigation": ["Dashboard", "Applications", "Compliance", "Scrutiny Desk", "EVC Tracking", "Audit & Reports"]
        },
        "Bureau Officer": {
            "name": "Shri Vikram Malhotra",
            "role": "Bureau Officer",
            "institution_id": None,
            "region": "Central (Bhopal)",
            "navigation": ["Dashboard", "Applications", "Compliance", "Scrutiny Desk", "EVC Tracking", "Audit & Reports"]
        },
        "EVC Coordinator": {
            "name": "Prof. Ramesh Rao",
            "role": "EVC Coordinator",
            "institution_id": None,
            "region": "National Bureau",
            "navigation": ["Dashboard", "EVC Tracking", "Applications", "Reports"]
        },
        "EVC Member": {
            "name": "Dr. Sunita Verma",
            "role": "EVC Member",
            "institution_id": None,
            "region": "National Bureau",
            "navigation": ["Dashboard", "EVC Tracking", "Applications", "Reports"]
        },
        "Committee Member": {
            "name": "Prof. H. R. Venkatesh",
            "role": "Committee Member",
            "institution_id": None,
            "region": "National Committee",
            "navigation": ["Applications", "Reports"]
        },
        "Competent Authority": {
            "name": "Prof. Rajive Kumar, Member Secretary",
            "role": "Competent Authority",
            "institution_id": None,
            "region": "AICTE Apex Council",
            "navigation": ["Applications", "Reports", "Statutory Sign-Off"]
        },
        "Authority": {
            "name": "Prof. T. G. Sitharam, Chairman",
            "role": "Authority",
            "institution_id": None,
            "region": "AICTE Apex Council",
            "navigation": ["Applications", "Reports", "Statutory Sign-Off"]
        },
        "Administrator": {
            "name": "System Administrator",
            "role": "Administrator",
            "institution_id": None,
            "region": "Headquarters",
            "navigation": ["Rules Admin", "Users", "Audit & Reports"]
        }
    }
    return profiles.get(role, profiles["Scrutiny Officer"])

# --- Institution Dashboard Summary ---
@app.get("/institutions/me/summary")
def get_institution_summary(institution_id: str = "INST-DELHI-001"):
    """
    Institution dashboard cards (§1.2 #1).
    Strictly scoped to institution_id; resolves scope leak (§10 #1).
    """
    apps = get_canonical_apps_list()
    inst_apps = [a for a in apps if a.get("institution_id") == institution_id]

    open_defs = 0
    for a in inst_apps:
        open_defs += sum(1 for d in a.get("deficiencies", []) if d.get("status") in ["OPEN", "RESUBMITTED"])

    next_action = "Create First Application for Academic Year 2026-2027" if len(inst_apps) == 0 else (
        f"Respond to {open_defs} active statutory deficiency notice(s)" if open_defs > 0 else "All submissions on track. Awaiting scrutiny updates."
    )

    return {
        "institution_id": institution_id,
        "institution_name": "Delhi Institute of Engineering" if institution_id == "INST-DELHI-001" else institution_id,
        "my_applications_count": len(inst_apps),
        "open_deficiencies_count": open_defs,
        "compliance_mandates_due": 8,  # 8 statutory mandates (Anti-Ragging, Grievance, ICC, etc.)
        "document_vault_verified": 4 if len(inst_apps) > 0 else 0,
        "next_required_action": next_action,
        "applications": inst_apps
    }

# --- Applications Listing & Pipeline ---
@app.get("/applications")
def list_applications(
    status: Optional[str] = None,
    q: Optional[str] = None,
    role: Optional[str] = None,
    institution_id: Optional[str] = None,
    region: Optional[str] = None,
    page: int = 1,
    page_size: int = 8,
    format: Optional[str] = None
):
    """
    Applications list with RBAC scoping, dynamic counts, search, and CSV export.
    Fixes §10: Scope leak, pagination text, and computed percentages.
    """
    all_apps = get_canonical_apps_list()
    filtered = list(all_apps)

    # 1. Scoped RBAC filtering (§5 & §10 #1)
    if role in ["Institution", "College User"] or institution_id:
        target_inst = institution_id or "INST-DELHI-001"
        filtered = [a for a in filtered if a.get("institution_id") == target_inst]
    elif role in ["Regional Officer", "Regional / Bureau Officer"] and region:
        reg_clean = region.split()[0].lower()
        filtered = [a for a in filtered if reg_clean in a.get("region", "").lower()]
    elif role == "Bureau Officer" and region:
        reg_clean = region.split()[0].lower()
        filtered = [a for a in filtered if reg_clean in a.get("region", "").lower()]

    # Global computed metrics for pipeline cards (based on current scope)
    total_count = len(filtered)
    approved_count = sum(1 for a in filtered if a.get("status") == "APPROVED")
    rejected_count = sum(1 for a in filtered if a.get("status") == "REJECTED")
    pending_count = sum(1 for a in filtered if a.get("status") in ["SUBMITTED", "UNDER_REVIEW", "COMMITTEE"])
    approval_rate = round((approved_count / total_count * 100), 1) if total_count > 0 else 0.0

    # Pipeline stages counts and computed percentages
    stage_counts = {
        "SUBMITTED": sum(1 for a in filtered if a.get("status") == "SUBMITTED"),
        "UNDER_REVIEW": sum(1 for a in filtered if a.get("status") == "UNDER_REVIEW"),
        "COMMITTEE": sum(1 for a in filtered if a.get("status") == "COMMITTEE"),
        "APPROVED": approved_count,
        "REJECTED": rejected_count
    }
    stage_percentages = {
        k: (round(v / total_count * 100, 1) if total_count > 0 else 0.0)
        for k, v in stage_counts.items()
    }

    # 2. Filter by Status chip
    if status and status.upper() != "ALL":
        filtered = [a for a in filtered if a.get("status", "").upper() == status.upper()]

    # 3. Filter by search query
    if q:
        query = q.lower()
        filtered = [
            a for a in filtered
            if query in a.get("id", "").lower() or
               query in a.get("case_id", "").lower() or
               query in a.get("college_name", "").lower() or
               query in a.get("region", "").lower() or
               query in a.get("type", "").lower()
        ]

    # CSV Export
    if format == "csv":
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Application_ID", "Institution", "Type", "Region", "Academic_Year", "Submitted", "Status", "Stage_Detail"])
        for a in filtered:
            writer.writerow([
                a.get("id"), a.get("college_name"), a.get("type"), a.get("region"),
                a.get("academic_year"), a.get("submitted_at"), a.get("status"), a.get("stage_detail")
            ])
        return Response(content=output.getvalue(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=aicte_applications.csv"})

    # Pagination
    total_matched = len(filtered)
    total_pages = max(1, (total_matched + page_size - 1) // page_size)
    start_idx = (page - 1) * page_size
    paged_items = filtered[start_idx:start_idx + page_size]

    return {
        "pipeline": {
            "total": total_count,
            "pending": pending_count,
            "approved": approved_count,
            "rejected": rejected_count,
            "approval_rate_pct": approval_rate,
            "stages": stage_counts,
            "stage_percentages": stage_percentages
        },
        "pagination": {
            "total_items": total_matched,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "showing_text": f"Showing {len(paged_items)} of {total_matched} • Page {page} of {total_pages}"
        },
        "items": paged_items
    }

# --- Specific Application Subroutes (Placed BEFORE greedy generic GET) ---
@app.post("/applications/{app_id:path}/deficiencies")
def raise_deficiency(app_id: str, req: RaiseDeficiencyRequest):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application not found")

    def_list = found.setdefault("deficiencies", [])
    def_num = len(def_list) + 1
    clean_id = found["id"].split("/")[-1]
    def_id = f"DEF-{clean_id}-{def_num:02d}"

    deadline_date = (datetime.utcnow() + timedelta(days=req.deadline_days)).strftime("%Y-%m-%d")

    new_def = {
        "id": def_id,
        "category": req.category,
        "description": req.description,
        "rule_id": req.rule_id,
        "handbook_clause": req.handbook_clause,
        "required_action": req.required_action,
        "deadline": deadline_date,
        "status": "OPEN",
        "raised_by": req.raised_by,
        "cleared_by": None
    }
    def_list.append(new_def)

    audit_store.log(
        actor=req.raised_by,
        role=req.role,
        action="DEFICIENCY_DISPATCHED",
        entity="DEFICIENCY",
        entity_id=def_id,
        details={"application_id": found["id"], "category": req.category, "issue": req.description}
    )

    return {
        "success": True,
        "deficiency": new_def,
        "message": f"Deficiency {def_id} issued with 14-business-day rectification deadline ({deadline_date})."
    }

@app.post("/applications/{app_id:path}/assign")
def assign_scrutiny_officer(app_id: str, req: AssignOfficerRequest):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application not found")

    found["assigned_officer_name"] = req.officer_name
    found["second_reviewer_name"] = req.second_reviewer_name or "Dr. R. K. Singhania"
    found["status"] = "UNDER_REVIEW"
    found["stage_detail"] = "TECHNICAL_SCRUTINY"
    found["state"] = "UNDER_REVIEW"
    found["stage_started_at"] = datetime.utcnow().strftime("%Y-%m-%d")
    found["due_at"] = (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d")

    audit_store.log(
        actor=req.role,
        role=req.role,
        action="SCRUTINY_OFFICER_ASSIGNED",
        entity="APPLICATION",
        entity_id=found["id"],
        details={"assigned_to": req.officer_name, "second_reviewer": found["second_reviewer_name"]}
    )

    return {
        "success": True,
        "id": found["id"],
        "status": found["status"],
        "stage_detail": found["stage_detail"],
        "assigned_officer": req.officer_name,
        "second_reviewer": found["second_reviewer_name"],
        "message": f"Application {found['id']} assigned to {req.officer_name}. Moved to Technical Scrutiny."
    }

@app.post("/applications/{app_id:path}/transition")
def trigger_transition(app_id: str, req: TransitionRequest):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application not found")

    current_state = found.get("status") or found.get("state", "UNDER_REVIEW")
    target = req.target_state

    # Map special actions
    if req.action == "ORDER_EVC":
        target = "COMMITTEE"
        found["stage_detail"] = "EVC_VISIT"
        found["evc_inspection"] = {
            "scheduled_date": (datetime.utcnow() + timedelta(days=14)).strftime("%Y-%m-%d"),
            "mode": "PHYSICAL",
            "panel_members": [],
            "status": "PANEL_EMPANELMENT_IN_PROGRESS"
        }
    elif req.action == "FAST_TRACK":
        target = "COMMITTEE"
        found["stage_detail"] = "COMMITTEE_HEARING"
        found["committee_hearing"] = {
            "committee_name": "Standing Hearing Committee (Fast-Tracked)",
            "status": "SCHEDULED"
        }
    elif req.action == "SIGN_OFF":
        target = "APPROVED" if "APPROV" in req.target_state.upper() else "REJECTED"
        found["stage_detail"] = "FINAL_DECISION"

    allowed, err_msg = can_transition(current_state, target, req.role)
    if not allowed:
        audit_store.log(
            actor=req.actor,
            role=req.role,
            action="ILLEGAL_TRANSITION_REJECTED",
            entity="APPLICATION",
            entity_id=found["id"],
            details={"attempted_from": current_state, "attempted_to": target, "error": err_msg}
        )
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=err_msg)

    found["status"] = target
    found["state"] = target
    found["stage_started_at"] = datetime.utcnow().strftime("%Y-%m-%d")

    audit_store.log(
        actor=req.actor,
        role=req.role,
        action="WORKFLOW_TRANSITION",
        entity="APPLICATION",
        entity_id=found["id"],
        details={"from_state": current_state, "to_state": target, "reason": req.reason, "action": req.action}
    )

    return {
        "success": True,
        "previous_state": current_state,
        "new_state": target,
        "stage_detail": found.get("stage_detail"),
        "message": f"Application successfully moved to {target} ({found.get('stage_detail')})."
    }

@app.post("/applications/{app_id:path}/decision")
def record_decision(app_id: str, req: DecisionRequest):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application not found")

    if req.role not in ["Competent Authority", "Authority"]:
        audit_store.log(
            actor=req.authority_name,
            role=req.role,
            action="UNAUTHORIZED_DECISION_ATTEMPT",
            entity="APPLICATION",
            entity_id=found["id"],
            details={"attempted_decision": req.decision_type}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Statutory Safeguard: Only the designated 'Competent Authority' can record final LoA/LoD/LoR decisions."
        )

    norm_decision = "APPROVED" if "LOA" in req.decision_type or "APPROV" in req.decision_type else "REJECTED"
    found["status"] = norm_decision
    found["state"] = norm_decision
    found["stage_detail"] = "FINAL_DECISION"
    found["final_decision"] = {
        "type": req.decision_type,
        "outcome": norm_decision,
        "authority": req.authority_name,
        "note": req.note,
        "signed_at": datetime.utcnow().isoformat() + "Z"
    }

    audit_store.log(
        actor=req.authority_name,
        role=req.role,
        action="STATUTORY_DECISION_RECORDED",
        entity="APPLICATION",
        entity_id=found["id"],
        details={"decision": req.decision_type, "note": req.note}
    )

    return {
        "success": True,
        "decision": req.decision_type,
        "status": norm_decision,
        "authority": req.authority_name,
        "message": f"Statutory order {req.decision_type} issued with digital seal and logged to audit chain."
    }

@app.post("/applications/{app_id:path}/validate")
def validate_application(app_id: str):
    return get_application(app_id)

@app.get("/applications/{app_id:path}/impact")
def get_application_impact_radar(app_id: str):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application not found")

    sim_days = GLOBAL_CONFIG["simulated_days"]
    return compute_impact_radar(found, sim_days=sim_days)

@app.get("/applications/{app_id:path}/risk")
def get_application_risk(app_id: str):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application not found")

    v = compile_verification(found)
    return v["risk_assessment"]

@app.get("/applications/{app_id:path}/documents")
def get_application_documents(app_id: str):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application not found")

    docs = [
        {
            "id": f"DOC-{found['id']}-01",
            "name": "Fire_Safety_NOC.pdf",
            "type": "Fire & Emergency Services NOC",
            "sha256": f"hash_{found['id'].replace('/', '_')}_fire_noc",
            "declared_expiry": found.get("fire_noc_expiry"),
            "extracted_expiry": found.get("extracted_fire_noc"),
            "confidence": found.get("doc_confidence", 0.95),
            "status": "MISMATCH" if found.get("extracted_fire_noc") != found.get("fire_noc_expiry") else "VERIFIED",
            "issuing_authority": "Directorate of Fire and Emergency Services"
        },
        {
            "id": f"DOC-{found['id']}-02",
            "name": "Land_Title_Deed_Consolidated.pdf",
            "type": "Revenue Land Title",
            "sha256": f"hash_{found['id'].replace('/', '_')}_land_title",
            "declared_area": f"{found.get('land_acres', 4.5)} Acres",
            "extracted_area": f"{found.get('land_acres', 4.5)} Acres",
            "confidence": 0.98,
            "status": "VERIFIED",
            "issuing_authority": "Sub-Registrar Office, Revenue Dept"
        },
        {
            "id": f"DOC-{found['id']}-03",
            "name": "Building_Occupancy_NOC.pdf",
            "type": "Municipal Building NOC",
            "sha256": f"hash_{found['id'].replace('/', '_')}_occupancy",
            "declared_built_up": f"{found.get('built_up_sqm', 8500)} Sq.m",
            "extracted_built_up": f"{found.get('built_up_sqm', 8500)} Sq.m",
            "confidence": 0.97,
            "status": "VERIFIED",
            "issuing_authority": "Municipal Town Planning Authority"
        }
    ]
    return docs

@app.get("/applications/{app_id:path}/audit")
def get_application_audit(app_id: str):
    chain = audit_store.chain
    app_entries = [e for e in chain if str(e.get("entity_id")) in [app_id, str(app_id).replace("AICTE/2026/", "")]]
    return app_entries

# Generic GET for application (MUST be after specific subroutes)
@app.get("/applications/{app_id:path}")
def get_application(app_id: str):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application record not found")

    verification = compile_verification(found)
    return {
        "metadata": {
            "id": found["id"],
            "case_id": found.get("case_id", found["id"]),
            "institution_id": found.get("institution_id"),
            "scenario_name": found.get("scenario_name", found.get("college_name")),
            "college_name": found["college_name"],
            "region": found["region"],
            "city": found.get("city", "City Campus"),
            "programme": found["programme"],
            "type": found.get("type", "New Approval"),
            "academic_year": found["academic_year"],
            "submitted_at": found.get("submitted_at", "2026-06-15"),
            "status": found.get("status", found.get("state", "UNDER_REVIEW")),
            "stage_detail": found.get("stage_detail", "TECHNICAL_SCRUTINY"),
            "assigned_officer_name": found.get("assigned_officer_name", "Dr. A. K. Sharma"),
            "second_reviewer_name": found.get("second_reviewer_name", "Rajeshwari Nair"),
            "dual_scrutiny_status": found.get("dual_scrutiny_status", "FIRST_REVIEW_COMPLETE"),
            "students": found["students"],
            "faculty_count": len(found.get("faculty", [])),
            "land_acres": found["land_acres"],
            "built_up_sqm": found["built_up_sqm"],
            "declared_labs": found["declared_labs"],
            "state": found.get("status", found.get("state"))
        },
        "deficiencies": found.get("deficiencies", []),
        "evc_inspection": found.get("evc_inspection"),
        "committee_hearing": found.get("committee_hearing"),
        "final_decision": found.get("final_decision"),
        "faculty": found.get("faculty", []),
        "verification": verification,
        "impact_radar": verification["impact_radar"],
        "sla": verification["sla"],
        "risk": verification["risk_assessment"]
    }

@app.post("/compliance/check")
def self_check_compliance_preview(req: SelfCheckRequest):
    preview_data = {
        "students": req.students,
        "faculty": [{"cadre": "PROFESSOR", "qualification": "Ph.D."}] * (req.faculty_count // 5) +
                   [{"cadre": "ASSISTANT PROFESSOR", "qualification": "M.Tech"}] * (req.faculty_count - (req.faculty_count // 5)),
        "land_acres": req.land_acres,
        "built_up_sqm": req.built_up_sqm,
        "declared_labs": req.declared_labs,
        "fire_noc_expiry": req.fire_noc_expiry,
        "programme": req.programme
    }
    rules = run_all_rules(preview_data, {"students_per_faculty": GLOBAL_CONFIG["students_per_faculty"]})
    return {
        "status": "PREVIEW_COMPLETE",
        "compliant_count": sum(1 for r in rules if r["status"] == "PASS"),
        "deficient_count": sum(1 for r in rules if r["status"] == "FAIL"),
        "rule_results": rules,
        "disclaimer": "Preview Mode: Algorithmic checks are advisory. No official application was created or modified."
    }

@app.post("/applications")
def create_application(req: CreateApplicationRequest):
    canonical_apps = get_canonical_apps_list()
    new_num = 1000 + len(canonical_apps) + 1
    new_id = f"AICTE/2026/APP-{new_num}"
    new_key = f"APP-{new_num}"

    faculty = []
    num_prof = max(1, req.faculty_count // 7)
    num_assoc = max(2, req.faculty_count // 4)
    num_asst = max(0, req.faculty_count - num_prof - num_assoc)

    for i in range(1, num_prof + 1):
        faculty.append({
            "id": f"fac-prof-{new_num}-{i}",
            "name": f"Dr. Faculty Member {i}",
            "cadre": "PROFESSOR",
            "qualification": "Ph.D. Engineering",
            "id_hash": f"hash_reg_{new_num}_{i}",
            "id_masked": f"PANPR{new_num % 100:02d}{i:02d}A",
            "join_date": "2024-01-01",
            "leave_date": None,
            "college_id": new_id,
            "college_name": req.college_name
        })
    for i in range(1, num_assoc + 1):
        faculty.append({
            "id": f"fac-assoc-{new_num}-{i}",
            "name": f"Dr. Assoc Member {i}",
            "cadre": "ASSOCIATE PROFESSOR",
            "qualification": "Ph.D. Engineering",
            "id_hash": f"hash_reg_assoc_{new_num}_{i}",
            "id_masked": f"PANAS{new_num % 100:02d}{i:02d}B",
            "join_date": "2024-06-01",
            "leave_date": None,
            "college_id": new_id,
            "college_name": req.college_name
        })
    for i in range(1, num_asst + 1):
        faculty.append({
            "id": f"fac-asst-{new_num}-{i}",
            "name": f"Prof. Asst Member {i}",
            "cadre": "ASSISTANT PROFESSOR",
            "qualification": "M.Tech Engineering",
            "id_hash": f"hash_reg_asst_{new_num}_{i}",
            "id_masked": f"PANST{new_num % 100:02d}{i:02d}C",
            "join_date": "2025-01-01",
            "leave_date": None,
            "college_id": new_id,
            "college_name": req.college_name
        })

    new_app = {
        "id": new_id,
        "case_id": new_id,
        "key": new_key,
        "institution_id": req.institution_id or "INST-DELHI-001",
        "scenario_name": f"{req.app_type}: {req.college_name}",
        "college_name": req.college_name,
        "region": req.region,
        "type": req.app_type,
        "programme": req.programme,
        "academic_year": req.academic_year,
        "submitted_at": datetime.utcnow().strftime("%Y-%m-%d"),
        "status": "SUBMITTED",
        "stage_detail": "INTAKE",
        "state": "SUBMITTED",
        "assigned_officer_id": None,
        "assigned_officer_name": "Unassigned",
        "second_reviewer_name": None,
        "dual_scrutiny_status": "PENDING_ASSIGNMENT",
        "stage_started_at": datetime.utcnow().strftime("%Y-%m-%d"),
        "due_at": (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%d"),
        "students": req.students,
        "faculty": faculty,
        "land_acres": req.land_acres,
        "built_up_sqm": req.built_up_sqm,
        "declared_labs": req.declared_labs,
        "fire_noc_expiry": req.fire_noc_expiry,
        "extracted_fire_noc": req.fire_noc_expiry,
        "doc_confidence": 0.96,
        "is_blurry": False,
        "other_system_faculty": [],
        "simulated_days": 0,
        "deficiencies": [],
        "evc_inspection": None,
        "committee_hearing": None,
        "final_decision": None
    }

    APP_STATE[new_key] = new_app
    APP_STATE[new_id] = new_app

    audit_store.log(
        actor="Institution Principal",
        role="Institution",
        action="APPLICATION_FILED",
        entity="APPLICATION",
        entity_id=new_id,
        details={
            "college_name": req.college_name,
            "type": req.app_type,
            "students": req.students,
            "faculty": len(faculty)
        }
    )

    return {
        "key": new_key,
        "id": new_id,
        "case_id": new_id,
        "college_name": req.college_name,
        "status": new_app["status"],
        "stage_detail": new_app["stage_detail"],
        "message": f"Statutory application {new_id} successfully filed and placed in Regional Intake Queue."
    }

# --- Deficiencies Lifecycle ---
@app.post("/deficiencies/{def_id}/resubmit")
def resubmit_deficiency(def_id: str, req: ResubmitDeficiencyRequest):
    target_def = None
    target_app = None

    for app in get_canonical_apps_list():
        for d in app.get("deficiencies", []):
            if d.get("id") == def_id:
                target_def = d
                target_app = app
                break
        if target_def:
            break

    if not target_def:
        raise HTTPException(status_code=404, detail="Deficiency ID not found")

    target_def["status"] = "RESUBMITTED"
    target_def["evidence"] = req.evidence_filename
    target_def["resubmitted_explanation"] = req.explanation

    audit_store.log(
        actor="Institution Applicant",
        role=req.role,
        action="DEFICIENCY_EVIDENCE_RESUBMITTED",
        entity="DEFICIENCY",
        entity_id=def_id,
        details={"evidence": req.evidence_filename, "explanation": req.explanation}
    )

    return {
        "success": True,
        "deficiency_id": def_id,
        "status": "RESUBMITTED",
        "message": f"Rectification evidence for {def_id} submitted. Queued for Scrutiny Officer verification."
    }

@app.post("/deficiencies/{def_id}/clear")
def clear_deficiency(def_id: str, req: ClearDeficiencyRequest):
    target_def = None
    target_app = None

    for app in get_canonical_apps_list():
        for d in app.get("deficiencies", []):
            if d.get("id") == def_id:
                target_def = d
                target_app = app
                break
        if target_def:
            break

    if not target_def:
        raise HTTPException(status_code=404, detail="Deficiency ID not found")

    target_def["status"] = "CLEARED"
    target_def["cleared_by"] = req.officer_name
    target_def["cleared_at"] = datetime.utcnow().isoformat() + "Z"

    audit_store.log(
        actor=req.officer_name,
        role=req.role,
        action="DEFICIENCY_VERIFIED_AND_CLEARED",
        entity="DEFICIENCY",
        entity_id=def_id,
        details={"notes": req.notes}
    )

    return {
        "success": True,
        "deficiency_id": def_id,
        "status": "CLEARED",
        "cleared_by": req.officer_name,
        "message": f"Deficiency {def_id} verified and cleared in statutory matrix."
    }

# --- EVC Tracking Endpoints ---
@app.get("/evc/inspections")
def list_evc_inspections():
    inspections = []
    for a in get_canonical_apps_list():
        if a.get("evc_inspection"):
            inspections.append({
                "application_id": a["id"],
                "college_name": a["college_name"],
                "region": a["region"],
                "inspection": a["evc_inspection"]
            })
    return {
        "scheduled_next_14_days": sum(1 for i in inspections if i["inspection"].get("status") != "COMPLETED"),
        "panel_pool_available": 42,
        "pending_hearings": 3,
        "inspections": inspections
    }

@app.post("/evc/inspections")
def schedule_evc_inspection(app_id: str = Query(...), req: EvcScheduleRequest = None):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application not found")

    sched = req or EvcScheduleRequest()
    found["evc_inspection"] = {
        "scheduled_date": sched.scheduled_date,
        "mode": sched.mode,
        "panel_members": sched.panel_members,
        "notes": sched.notes,
        "status": "SCHEDULED"
    }
    found["stage_detail"] = "EVC_VISIT"

    audit_store.log(
        actor=sched.role,
        role=sched.role,
        action="EVC_INSPECTION_SCHEDULED",
        entity="EVC",
        entity_id=found["id"],
        details={"scheduled_date": sched.scheduled_date, "panel": sched.panel_members}
    )

    return {
        "success": True,
        "inspection": found["evc_inspection"],
        "message": f"EVC inspection scheduled for {sched.scheduled_date} with expert panel."
    }

@app.post("/evc/inspections/{app_id:path}/report")
def submit_evc_report(app_id: str, req: EvcReportRequest):
    found = find_application(app_id)
    if not found:
        raise HTTPException(status_code=404, detail="Application not found")

    if not found.get("evc_inspection"):
        found["evc_inspection"] = {}

    found["evc_inspection"]["status"] = "COMPLETED"
    found["evc_inspection"]["report_status"] = req.status
    found["evc_inspection"]["report_notes"] = req.report_notes
    found["evc_inspection"]["submitted_by"] = req.member_name
    found["evc_inspection"]["submitted_at"] = datetime.utcnow().isoformat() + "Z"
    found["stage_detail"] = "COMMITTEE_HEARING"

    audit_store.log(
        actor=req.member_name,
        role=req.role,
        action="EVC_OBSERVATION_REPORT_SUBMITTED",
        entity="EVC",
        entity_id=found["id"],
        details={"status": req.status, "notes": req.report_notes}
    )

    return {
        "success": True,
        "report_status": req.status,
        "stage_detail": "COMMITTEE_HEARING",
        "message": "EVC observation report logged. Case advanced to Committee Hearing stage."
    }

# --- Summaries for Scrutiny and Regional Desks ---
@app.get("/scrutiny/summary")
def get_scrutiny_desk_summary():
    apps = get_canonical_apps_list()
    queued = [a for a in apps if a.get("status") == "UNDER_REVIEW"]

    all_defs = []
    active_count = 0
    cleared_count = 0

    for a in apps:
        for d in a.get("deficiencies", []):
            item = dict(d)
            item["application_id"] = a["id"]
            item["college_name"] = a["college_name"]
            all_defs.append(item)
            if d.get("status") in ["OPEN", "RESUBMITTED"]:
                active_count += 1
            elif d.get("status") == "CLEARED":
                cleared_count += 1

    return {
        "queued_for_scrutiny": len(queued),
        "active_deficiencies": active_count,
        "rectified_deficiencies": cleared_count,
        "average_turnaround_days": 3.2,
        "casework_queue": queued,
        "all_active_deficiencies": [d for d in all_defs if d.get("status") in ["OPEN", "RESUBMITTED"]]
    }

@app.get("/regions/{region}/summary")
def get_regional_desk_summary(region: str):
    apps = get_canonical_apps_list()
    reg_clean = region.split()[0].lower()
    reg_apps = [a for a in apps if reg_clean in a.get("region", "").lower()] if region != "ALL" else apps

    unassigned = [a for a in reg_apps if a.get("status") == "SUBMITTED" or not a.get("assigned_officer_name")]
    in_progress = [a for a in reg_apps if a.get("status") == "UNDER_REVIEW"]

    # Compute alerts & escalations
    escalations = 0
    for a in reg_apps:
        sla = calculate_sla_status(a.get("status", "UNDER_REVIEW"), a.get("stage_started_at", "2026-06-16"), GLOBAL_CONFIG["simulated_days"])
        if sla.get("status") in ["WARNING", "OVERDUE"]:
            escalations += 1

    return {
        "jurisdiction": region,
        "regional_queue": len(reg_apps),
        "unassigned_work": len(unassigned),
        "active_in_progress": len(in_progress),
        "deadlines_and_escalations": escalations,
        "caseload_registry": reg_apps
    }

@app.get("/analytics/bottlenecks")
def get_bottleneck_analytics():
    """Aggregated bottleneck analytics for Bureau Officer (§6 & §10)."""
    apps = get_canonical_apps_list()
    causes: Dict[str, Dict[str, Any]] = {}

    for a in apps:
        for d in a.get("deficiencies", []):
            if d.get("status") in ["OPEN", "RESUBMITTED"]:
                cat = d.get("category", "Other")
                if cat not in causes:
                    causes[cat] = {"category": cat, "count": 0, "sample_issues": []}
                causes[cat]["count"] += 1
                if len(causes[cat]["sample_issues"]) < 2:
                    causes[cat]["sample_issues"].append(f"{a['college_name']}: {d['description']}")

    fire_mismatch_apps = [a["college_name"] for a in apps if a.get("extracted_fire_noc") != a.get("fire_noc_expiry") and a.get("extracted_fire_noc")]
    if fire_mismatch_apps:
        causes["Safety Certificate Mismatch"] = {
            "category": "Safety Certificate Mismatch",
            "count": len(fire_mismatch_apps),
            "sample_issues": [f"{name}: Declared vs Extracted expiry date mismatch" for name in fire_mismatch_apps]
        }

    return {
        "total_active_bottlenecks": sum(c["count"] for c in causes.values()),
        "bottlenecks": sorted(list(causes.values()), key=lambda x: x["count"], reverse=True),
        "disclaimer": "Assistive bottleneck analysis across pending statutory caseload."
    }

@app.get("/activity")
def get_activity_feed(limit: int = 15):
    """Recent immutable activity feed (§1.2 & §8)."""
    chain = audit_store.chain
    reversed_entries = list(reversed(chain))[:limit]
    return reversed_entries

# --- Existing Routes Preserved for Full Compatibility ---
@app.get("/scenarios")
def list_scenarios():
    summary_list = []
    seen = set()
    for key, data in APP_STATE.items():
        case_id = data.get("id")
        if case_id and case_id not in seen:
            seen.add(case_id)
            summary_list.append({
                "key": data.get("key", key),
                "id": data["id"],
                "scenario_name": data.get("scenario_name", data.get("college_name")),
                "college_name": data["college_name"],
                "region": data["region"],
                "programme": data["programme"],
                "state": data.get("status", data.get("state", "UNDER_REVIEW")),
                "expected_band": data.get("expected_band", "AMBER"),
                "expected_summary": data.get("expected_summary", "")
            })
    return summary_list

@app.get("/colleges/{college_key}/faculty-trend")
def get_faculty_trend(college_key: str):
    found = find_application(college_key)
    if not found:
        found = APP_STATE.get("S5") or APP_STATE.get("APP-1042")

    trend = calculate_monthly_snapshots(
        faculty_roster=found.get("faculty", []),
        students=found.get("students", 600),
        fsr_ratio=GLOBAL_CONFIG["students_per_faculty"]
    )
    return trend

@app.get("/institutions/{inst_id}/faculty-trend")
def get_institution_faculty_trend(inst_id: str):
    return get_faculty_trend(inst_id)

@app.post("/flags/{flag_id}/review")
def review_flag(flag_id: str, req: FlagReviewRequest):
    audit_store.log(
        actor=req.officer_name,
        role=req.role,
        action="FLAG_REVIEW",
        entity="FLAG",
        entity_id=flag_id,
        details={"action": req.action, "note": req.note}
    )
    return {
        "flag_id": flag_id,
        "status": req.action,
        "reviewer": req.officer_name,
        "message": f"Flag {flag_id} updated to '{req.action}'."
    }

@app.post("/extractions/{extraction_id}/override")
def override_extraction(extraction_id: str, req: ExtractionOverrideRequest):
    audit_store.log(
        actor=req.officer_name,
        role=req.role,
        action="EXTRACTION_OVERRIDE",
        entity="DOCUMENT_EXTRACTION",
        entity_id=extraction_id,
        details={"overridden_value": req.overridden_value, "reason": req.reason}
    )
    return {
        "extraction_id": extraction_id,
        "overridden_value": req.overridden_value,
        "message": "Document AI extraction overridden by officer. Audit trail updated."
    }

@app.get("/audit/ledger")
def get_audit_ledger():
    return audit_store.chain

@app.get("/audit/verify")
def verify_audit_chain():
    return audit_store.verify()

@app.get("/config")
def get_config():
    return GLOBAL_CONFIG

@app.post("/config")
def update_config(req: ConfigUpdateRequest):
    if req.students_per_faculty is not None:
        GLOBAL_CONFIG["students_per_faculty"] = req.students_per_faculty
        audit_store.log(
            actor="Admin",
            role="Admin",
            action="RULEBOOK_CONFIG_UPDATE",
            entity="RULE_FSR-001",
            entity_id="FSR-001",
            details={"students_per_faculty": req.students_per_faculty}
        )
    if req.simulated_days is not None:
        GLOBAL_CONFIG["simulated_days"] = req.simulated_days

    return {
        "config": GLOBAL_CONFIG,
        "message": "Configuration parameters updated. Subsequent rule evaluations reflect revised thresholds."
    }

# Mount static web interface
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
