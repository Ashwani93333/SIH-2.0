import math
from datetime import datetime, date
from typing import Dict, Any, List

def evaluate_fsr(students: int, actual_faculty: int, students_per_faculty: int = 20, version: int = 1) -> Dict[str, Any]:
    """
    FSR-001: Faculty–student ratio (Demo ratio 1:20)
    Clause reference: APH 2024-27 Appendix 7.1
    """
    if students <= 0 or students_per_faculty <= 0:
        required = 0
    else:
        required = math.ceil(students / students_per_faculty)
    
    shortfall = max(required - actual_faculty, 0)
    status = "PASS" if shortfall == 0 else "FAIL"
    explanation = (
        f"Required {required} faculty for {students} students at 1:{students_per_faculty}; "
        f"{actual_faculty} recorded; shortfall {shortfall}."
    )
    return {
        "rule_id": "FSR-001",
        "name": "Faculty–student ratio",
        "rule_version": version,
        "inputs": {
            "students": students,
            "actual": actual_faculty,
            "students_per_faculty": students_per_faculty
        },
        "required": required,
        "actual": actual_faculty,
        "shortfall": shortfall,
        "status": status,
        "severity": "HIGH",
        "source_clause": "APH 2024-27 Appendix 7.1 (Demo Setting: 1:20)",
        "explanation": explanation
    }

def evaluate_cadre(professors: int, assoc_profs: int, asst_profs: int, required_faculty: int, version: int = 1) -> Dict[str, Any]:
    """
    CAD-002: Faculty Cadre Distribution (Norm 1:2:6 ratio)
    Clause reference: APH 2024-27 Appendix 7.2
    """
    # 1:2:6 out of 9 parts
    req_prof = math.ceil(required_faculty * (1 / 9))
    req_assoc = math.ceil(required_faculty * (2 / 9))
    req_asst = max(required_faculty - req_prof - req_assoc, 0)

    shortfall_prof = max(req_prof - professors, 0)
    shortfall_assoc = max(req_assoc - assoc_profs, 0)
    shortfall_asst = max(req_asst - asst_profs, 0)
    total_shortfall = shortfall_prof + shortfall_assoc + shortfall_asst

    status = "PASS" if total_shortfall == 0 else "FAIL"
    explanation = (
        f"Cadre distribution (1:2:6 norm). Prof: {professors}/{req_prof} (short {shortfall_prof}), "
        f"Assoc: {assoc_profs}/{req_assoc} (short {shortfall_assoc}), "
        f"Asst: {asst_profs}/{req_asst} (short {shortfall_asst}). Total cadre shortfall: {total_shortfall}."
    )
    return {
        "rule_id": "CAD-002",
        "name": "Faculty cadre distribution",
        "rule_version": version,
        "inputs": {
            "professors": professors,
            "assoc_profs": assoc_profs,
            "asst_profs": asst_profs,
            "required_faculty": required_faculty
        },
        "required": {"prof": req_prof, "assoc": req_assoc, "asst": req_asst},
        "actual": {"prof": professors, "assoc": assoc_profs, "asst": asst_profs},
        "shortfall": total_shortfall,
        "status": status,
        "severity": "MEDIUM",
        "source_clause": "APH 2024-27 Appendix 7.2",
        "explanation": explanation
    }

def evaluate_qualifications(faculty_list: List[Dict[str, Any]], version: int = 1) -> Dict[str, Any]:
    """
    QUA-003: Faculty qualification minimums
    Professors and Associate Professors must have Ph.D.
    Assistant Professors must have M.Tech/Postgraduate in relevant field.
    """
    unqualified = []
    for f in faculty_list:
        cadre = f.get("cadre", "").upper()
        qual = f.get("qualification", "").upper()
        if cadre in ["PROFESSOR", "ASSOCIATE PROFESSOR"] and "PH.D" not in qual and "PHD" not in qual:
            unqualified.append(f"{f.get('name')} ({cadre}): Ph.D required, found {qual}")
        elif cadre == "ASSISTANT PROFESSOR" and not any(q in qual for q in ["M.TECH", "ME", "M.E.", "M.SC", "PHD", "PH.D"]):
            unqualified.append(f"{f.get('name')} ({cadre}): PG required, found {qual}")

    shortfall = len(unqualified)
    status = "PASS" if shortfall == 0 else "FAIL"
    explanation = (
        "All faculty meet qualification norms."
        if shortfall == 0
        else f"{shortfall} faculty members do not meet minimum qualification criteria."
    )
    return {
        "rule_id": "QUA-003",
        "name": "Faculty qualification minimum",
        "rule_version": version,
        "inputs": {"total_evaluated": len(faculty_list)},
        "required": len(faculty_list),
        "actual": len(faculty_list) - shortfall,
        "shortfall": shortfall,
        "status": status,
        "severity": "HIGH",
        "source_clause": "APH 2024-27 Clause 7.4",
        "explanation": explanation,
        "details": unqualified
    }

def evaluate_land_area(land_acres: float, built_up_sqm: float, required_land: float = 4.0, required_built_up: float = 8000.0, version: int = 1) -> Dict[str, Any]:
    """
    LND-004: Land and built-up area requirement
    Clause reference: APH 2024-27 Appendix 4
    """
    land_short = max(required_land - land_acres, 0.0)
    built_short = max(required_built_up - built_up_sqm, 0.0)
    shortfall = round(land_short + (built_short / 1000.0), 2)
    status = "PASS" if land_short == 0 and built_short == 0 else "FAIL"
    explanation = (
        f"Land: {land_acres} ac (req {required_land} ac); Built-up: {built_up_sqm} sqm (req {required_built_up} sqm)."
        if status == "PASS"
        else f"Area deficit: Land short by {round(land_short,2)} acres, Built-up short by {round(built_short,2)} sqm."
    )
    return {
        "rule_id": "LND-004",
        "name": "Land & built-up area requirement",
        "rule_version": version,
        "inputs": {"land_acres": land_acres, "built_up_sqm": built_up_sqm},
        "required": {"land_acres": required_land, "built_up_sqm": required_built_up},
        "actual": {"land_acres": land_acres, "built_up_sqm": built_up_sqm},
        "shortfall": shortfall,
        "status": status,
        "severity": "HIGH",
        "source_clause": "APH 2024-27 Appendix 4",
        "explanation": explanation
    }

def evaluate_laboratories(declared_labs: int, required_labs: int = 18, version: int = 1) -> Dict[str, Any]:
    """
    LAB-005: Laboratory requirement per sanctioned intake
    Clause reference: APH 2024-27 Appendix 5
    """
    shortfall = max(required_labs - declared_labs, 0)
    status = "PASS" if shortfall == 0 else "FAIL"
    explanation = (
        f"Laboratories verified: {declared_labs}/{required_labs} operational."
        if shortfall == 0
        else f"Deficiency: {shortfall} required laboratories missing (declared {declared_labs}, required {required_labs})."
    )
    return {
        "rule_id": "LAB-005",
        "name": "Laboratory equipment & spaces",
        "rule_version": version,
        "inputs": {"declared_labs": declared_labs, "required_labs": required_labs},
        "required": required_labs,
        "actual": declared_labs,
        "shortfall": shortfall,
        "status": status,
        "severity": "MEDIUM",
        "source_clause": "APH 2024-27 Appendix 5",
        "explanation": explanation
    }

def evaluate_certificate_validity(expiry_str: str, ref_date_str: str = "2026-10-25", cert_name: str = "Fire NOC", version: int = 1) -> Dict[str, Any]:
    """
    CRT-006: Statutory certificate validity (Fire NOC, Occupancy, etc.)
    Clause reference: APH 2024-27 Clause 2.3.4
    """
    if not expiry_str:
        return {
            "rule_id": "CRT-006",
            "name": f"{cert_name} validity",
            "rule_version": version,
            "inputs": {"expiry": expiry_str, "reference_date": ref_date_str},
            "required": "Valid Certificate",
            "actual": "Missing",
            "shortfall": 1,
            "status": "MISSING_EVIDENCE",
            "severity": "HIGH",
            "source_clause": "APH 2024-27 Clause 2.3.4",
            "explanation": f"{cert_name} document or expiry date not provided."
        }

    try:
        exp_dt = datetime.strptime(expiry_str, "%Y-%m-%d").date()
        ref_dt = datetime.strptime(ref_date_str, "%Y-%m-%d").date()
    except Exception:
        return {
            "rule_id": "CRT-006",
            "name": f"{cert_name} validity",
            "rule_version": version,
            "inputs": {"expiry": expiry_str, "reference_date": ref_date_str},
            "required": "Valid Date Format",
            "actual": expiry_str,
            "shortfall": 1,
            "status": "NEEDS_REVIEW",
            "severity": "HIGH",
            "source_clause": "APH 2024-27 Clause 2.3.4",
            "explanation": f"Unable to parse certificate expiry date: {expiry_str}."
        }

    days_left = (exp_dt - ref_dt).days
    if days_left < 0:
        status = "FAIL"
        explanation = f"{cert_name} expired on {expiry_str} ({abs(days_left)} days ago as of reference date)."
        shortfall = 1
    elif days_left < 60:
        status = "NEEDS_REVIEW"
        explanation = f"{cert_name} valid until {expiry_str}, but expires within {days_left} days. Renewal required."
        shortfall = 0
    else:
        status = "PASS"
        explanation = f"{cert_name} valid until {expiry_str} ({days_left} days remaining)."
        shortfall = 0

    return {
        "rule_id": "CRT-006",
        "name": f"{cert_name} validity",
        "rule_version": version,
        "inputs": {"expiry": expiry_str, "reference_date": ref_date_str, "days_left": days_left},
        "required": "Valid certificate (> 60 days)",
        "actual": f"Expires {expiry_str}",
        "shortfall": shortfall,
        "status": status,
        "severity": "HIGH",
        "source_clause": "APH 2024-27 Clause 2.3.4",
        "explanation": explanation
    }

def run_all_rules(college_data: Dict[str, Any], custom_params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    params = custom_params or {}
    fsr_ratio = params.get("students_per_faculty", 20)
    students = college_data.get("students", 600)
    faculty_list = college_data.get("faculty", [])
    actual_faculty = len(faculty_list)

    # 1. FSR
    fsr_res = evaluate_fsr(students, actual_faculty, fsr_ratio)

    # Count cadres
    profs = sum(1 for f in faculty_list if f.get("cadre", "").upper() == "PROFESSOR")
    assocs = sum(1 for f in faculty_list if f.get("cadre", "").upper() == "ASSOCIATE PROFESSOR")
    assts = sum(1 for f in faculty_list if f.get("cadre", "").upper() == "ASSISTANT PROFESSOR")

    # 2. Cadre
    cad_res = evaluate_cadre(profs, assocs, assts, fsr_res["required"])

    # 3. Qualification
    qua_res = evaluate_qualifications(faculty_list)

    # 4. Land
    land = college_data.get("land_acres", 4.5)
    built = college_data.get("built_up_sqm", 8500.0)
    lnd_res = evaluate_land_area(land, built)

    # 5. Labs
    declared_labs = college_data.get("declared_labs", 20)
    lab_res = evaluate_laboratories(declared_labs)

    # 6. Fire NOC
    fire_expiry = college_data.get("fire_noc_expiry", "2027-05-15")
    ref_date = college_data.get("reference_date", "2026-10-25")
    crt_res = evaluate_certificate_validity(fire_expiry, ref_date, cert_name="Fire NOC")

    return [fsr_res, cad_res, qua_res, lnd_res, lab_res, crt_res]
