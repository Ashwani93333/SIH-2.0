from typing import List, Dict, Any
from datetime import datetime

def check_date_overlap(start_a: str, end_a: str, start_b: str, end_b: str) -> bool:
    """
    Returns True if period A overlaps with period B.
    Open-ended (None/empty) end date is treated as ongoing.
    """
    dt_start_a = datetime.strptime(start_a, "%Y-%m-%d").date()
    dt_end_a = datetime.strptime(end_a, "%Y-%m-%d").date() if end_a else datetime.max.date()

    dt_start_b = datetime.strptime(start_b, "%Y-%m-%d").date()
    dt_end_b = datetime.strptime(end_b, "%Y-%m-%d").date() if end_b else datetime.max.date()

    return max(dt_start_a, dt_start_b) <= min(dt_end_a, dt_end_b)

def detect_faculty_duplicates(current_college_faculty: List[Dict[str, Any]], all_system_faculty: List[Dict[str, Any]], current_college_id: str) -> List[Dict[str, Any]]:
    """
    Cross-Record Validation Layer 3:
    Detects shared faculty identifier across institutions.
    Classifies into DUPLICATE_OVERLAP (HIGH) vs DUPLICATE_SEQUENTIAL (LOW).
    """
    flags = []

    for fac in current_college_faculty:
        fac_hash = fac.get("id_hash")
        if not fac_hash:
            continue

        join_a = fac.get("join_date", "2024-01-01")
        leave_a = fac.get("leave_date")

        # Find matches in other colleges
        matches = [
            f for f in all_system_faculty 
            if f.get("college_id") != current_college_id and f.get("id_hash") == fac_hash
        ]

        for match in matches:
            join_b = match.get("join_date", "2024-01-01")
            leave_b = match.get("leave_date")

            is_overlapping = check_date_overlap(join_a, leave_a, join_b, join_b if leave_b else None)

            if is_overlapping:
                flags.append({
                    "flag_id": f"DUP-{fac.get('id')}-{match.get('id')}",
                    "flag_type": "DUPLICATE_OVERLAP",
                    "severity": "HIGH",
                    "faculty_name": fac.get("name"),
                    "masked_id": fac.get("id_masked", "ABCDE****F"),
                    "current_college": current_college_id,
                    "matched_college": match.get("college_name", match.get("college_id")),
                    "period_current": f"{join_a} to {leave_a or 'Present'}",
                    "period_matched": f"{join_b} to {leave_b or 'Present'}",
                    "explanation": (
                        f"Faculty '{fac.get('name')}' (ID: {fac.get('id_masked')}) is concurrently listed with "
                        f"active tenure in '{match.get('college_name', match.get('college_id'))}' during overlapping dates."
                    ),
                    "disclaimer": "Signal for officer verification; could indicate non-relieved tenure or reporting delay. Human investigation required before action.",
                    "status": "OPEN",
                    "review_action": None
                })
            else:
                flags.append({
                    "flag_id": f"DUP-SEQ-{fac.get('id')}-{match.get('id')}",
                    "flag_type": "DUPLICATE_SEQUENTIAL",
                    "severity": "LOW",
                    "faculty_name": fac.get("name"),
                    "masked_id": fac.get("id_masked", "ABCDE****F"),
                    "current_college": current_college_id,
                    "matched_college": match.get("college_name", match.get("college_id")),
                    "period_current": f"{join_a} to {leave_a or 'Present'}",
                    "period_matched": f"{join_b} to {leave_b or 'Present'}",
                    "explanation": (
                        f"Faculty '{fac.get('name')}' previously served at '{match.get('college_name', match.get('college_id'))}'. "
                        "Tenure dates are sequential without active overlap."
                    ),
                    "disclaimer": "Informational record of prior career transition.",
                    "status": "OPEN",
                    "review_action": None
                })

    return flags
