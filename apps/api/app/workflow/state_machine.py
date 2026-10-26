from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, timedelta

# Both legacy and 4-stage statutory transitions supported
ALLOWED_TRANSITIONS = {
    # Statutory 4-Stage Workflow (SETU_PROCESS_SPEC §3)
    "SUBMITTED": [
        ("UNDER_REVIEW", ["Regional Officer", "Bureau Officer", "Regional / Bureau Officer", "Admin", "System"]),
        ("AUTO_VERIFICATION", ["System", "Admin"])
    ],
    "UNDER_REVIEW": [
        ("UNDER_REVIEW", ["Scrutiny Officer", "Institution", "College User", "Admin"]),
        ("COMMITTEE", ["Scrutiny Officer", "Regional Officer", "Bureau Officer", "Admin"]),
        ("RETURNED_FOR_CORRECTION", ["Scrutiny Officer", "Admin"]),
        ("EVC_PENDING", ["Scrutiny Officer", "Admin"])
    ],
    "COMMITTEE": [
        ("APPROVED", ["Competent Authority", "Authority", "Admin"]),
        ("REJECTED", ["Competent Authority", "Authority", "Admin"]),
        ("DECISION_PENDING", ["Regional / Bureau Officer", "Regional Officer", "Bureau Officer", "Admin"]),
        ("COMMITTEE", ["EVC Coordinator", "EVC Member", "Committee Member", "Admin"])
    ],
    "APPROVED": [("MONITORING", ["System", "Admin"])],
    "REJECTED": [],

    # Legacy state paths (kept for backward compatibility with existing tests)
    "DRAFT": [("SUBMITTED", ["College User", "Institution", "Admin"])],
    "AUTO_VERIFICATION": [("SCRUTINY", ["System", "Admin"]), ("UNDER_REVIEW", ["System", "Admin"])],
    "SCRUTINY": [
        ("RETURNED_FOR_CORRECTION", ["Scrutiny Officer", "Admin"]),
        ("EVC_PENDING", ["Scrutiny Officer", "Admin"]),
        ("COMMITTEE", ["Scrutiny Officer", "Admin"]),
        ("UNDER_REVIEW", ["Scrutiny Officer", "Admin"])
    ],
    "RETURNED_FOR_CORRECTION": [
        ("SCRUTINY", ["College User", "Institution", "Admin"]),
        ("UNDER_REVIEW", ["College User", "Institution", "Admin"])
    ],
    "EVC_PENDING": [
        ("EVC_COMPLETED", ["EVC Member / Coordinator", "EVC Coordinator", "EVC Member", "Admin"])
    ],
    "EVC_COMPLETED": [
        ("COMMITTEE", ["EVC Member / Coordinator", "Regional / Bureau Officer", "Regional Officer", "Admin"])
    ],
    "DECISION_PENDING": [
        ("LOA_ISSUED", ["Competent Authority", "Authority"]),
        ("LOD_ISSUED", ["Competent Authority", "Authority"]),
        ("LOR_ISSUED", ["Competent Authority", "Authority"]),
        ("APPROVED", ["Competent Authority", "Authority"]),
        ("REJECTED", ["Competent Authority", "Authority"])
    ],
    "LOA_ISSUED": [("MONITORING", ["System", "Admin"])],
    "LOD_ISSUED": [],
    "LOR_ISSUED": []
}

SLA_SETTINGS = {
    "SUBMITTED": {"days": 2, "hours": 48, "warning_pct": 0.7, "escalate_to": "Regional Officer", "owner": "Regional / Bureau Officer"},
    "UNDER_REVIEW": {"days": 7, "warning_pct": 0.7, "escalate_to": "Regional Officer", "owner": "Scrutiny Officer"},
    "SCRUTINY": {"days": 10, "warning_pct": 0.7, "escalate_to": "Regional Officer", "owner": "Scrutiny Officer"},
    "RETURNED_FOR_CORRECTION": {"days": 14, "warning_pct": 0.7, "escalate_to": "Institution Escalation", "owner": "Institution"},
    "EVC_PENDING": {"days": 7, "warning_pct": 0.7, "escalate_to": "Regional Coordinator", "owner": "EVC Coordinator"},
    "EVC_VISIT": {"days": 5, "warning_pct": 0.7, "escalate_to": "Regional Coordinator", "owner": "EVC Member"},
    "COMMITTEE": {"days": 10, "warning_pct": 0.7, "escalate_to": "Bureau Head", "owner": "Committee Member"},
    "DECISION_PENDING": {"days": 5, "warning_pct": 0.8, "escalate_to": "Apex Council", "owner": "Competent Authority"},
    "DEFICIENCY_RESPONSE": {"days": 14, "warning_pct": 0.7, "escalate_to": "Regional Officer Alert", "owner": "Institution"}
}

def can_transition(current_state: str, target_state: str, role: str) -> Tuple[bool, Optional[str]]:
    """
    Validates if role has permission to execute transition from current_state to target_state.
    Enforces strict role boundaries (SETU_PROCESS_SPEC §3 & §5).
    """
    valid_targets = ALLOWED_TRANSITIONS.get(current_state, [])
    for (state, roles) in valid_targets:
        if state == target_state:
            # Check role match
            matched = any(
                r.lower() == role.lower() or 
                (r in ["College User", "Institution"] and role in ["College User", "Institution"]) or
                (r in ["Competent Authority", "Authority"] and role in ["Competent Authority", "Authority"]) or
                (r in ["Regional / Bureau Officer", "Regional Officer", "Bureau Officer"] and role in ["Regional / Bureau Officer", "Regional Officer", "Bureau Officer"])
                for r in roles
            )
            if matched or role == "Admin":
                return True, None
            return False, f"Role '{role}' is not authorized to transition from {current_state} to {target_state}. Authorized roles: {', '.join(roles)}."
    
    return False, f"Illegal state transition from {current_state} to {target_state}."

def compute_sla_status(started_at_dt: datetime, due_at_dt: datetime, now_dt: datetime) -> str:
    """
    Deterministic SLA status function (§4):
    used = (now - started_at) / (due_at - started_at)
    return "ESCALATED" if used >= 1 else "WARNING" if used >= 0.7 else "ON_TRACK"
    """
    total_seconds = (due_at_dt - started_at_dt).total_seconds()
    if total_seconds <= 0:
        return "ESCALATED"
    used = (now_dt - started_at_dt).total_seconds() / total_seconds
    if used >= 1.0:
        return "ESCALATED"
    elif used >= 0.7:
        return "WARNING"
    return "ON_TRACK"

def calculate_sla_status(state: str, state_started_at: str, simulated_days_offset: int = 0) -> Dict[str, Any]:
    """
    Calculates SLA remaining, clock owner, warnings, and escalation level.
    """
    sla_config = SLA_SETTINGS.get(state) or SLA_SETTINGS.get("SCRUTINY", {"days": 7, "warning_pct": 0.7, "escalate_to": "Regional Officer", "owner": "AICTE Officer"})

    total_days = sla_config.get("days", 7)
    escalate_to = sla_config.get("escalate_to", "Regional Officer")
    warn_threshold = total_days * sla_config.get("warning_pct", 0.7)
    clock_owner = sla_config.get("owner", "AICTE Officer")

    try:
        start_dt = datetime.strptime(state_started_at, "%Y-%m-%d")
    except Exception:
        start_dt = datetime.utcnow()

    due_dt = start_dt + timedelta(days=total_days)
    now_dt = start_dt + timedelta(days=simulated_days_offset)

    effective_days_elapsed = max(0, simulated_days_offset)
    days_remaining = total_days - effective_days_elapsed

    status = compute_sla_status(start_dt, due_dt, now_dt)

    if status == "ESCALATED" or days_remaining < 0:
        overdue_days = max(1, abs(days_remaining)) if days_remaining < 0 else 1
        escalation_level = 3 if overdue_days >= 3 else 2
        message = f"SLA Breached by {overdue_days} days. Escalated to {escalate_to} (Level {escalation_level})."
        sla_status_label = "OVERDUE"
    elif status == "WARNING" or days_remaining <= (total_days - warn_threshold):
        escalation_level = 1
        message = f"Upcoming Deadline Warning: {days_remaining} working days remaining for {state} completion."
        sla_status_label = "WARNING"
    else:
        escalation_level = 0
        message = f"On Track: {days_remaining} of {total_days} days remaining."
        sla_status_label = "ON_TRACK"

    return {
        "state": state,
        "has_sla": True,
        "clock_owner": clock_owner,
        "total_days": total_days,
        "days_elapsed": effective_days_elapsed,
        "days_remaining": max(0, days_remaining),
        "status": sla_status_label,
        "sla_flag": status,  # "ON_TRACK", "WARNING", "ESCALATED"
        "escalation_level": escalation_level,
        "escalated_to": escalate_to if escalation_level > 0 else None,
        "due_date": due_dt.strftime("%Y-%m-%d"),
        "message": message
    }
