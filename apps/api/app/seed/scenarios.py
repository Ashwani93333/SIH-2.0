from typing import Dict, Any, List

def get_demo_scenarios() -> Dict[str, Dict[str, Any]]:
    # Shared faculty for duplicate test
    rajesh_verma = {
        "id": "fac-101",
        "name": "Dr. Rajesh Verma",
        "cadre": "PROFESSOR",
        "qualification": "Ph.D. Computer Science",
        "id_hash": "hash_rajesh_9921",
        "id_masked": "ABCDE****F",
        "join_date": "2024-07-01",
        "leave_date": None,
        "college_id": "COL-ABC",
        "college_name": "ABC Institute of Technology"
    }

    rajesh_matched_xyz = {
        "id": "fac-902",
        "name": "Dr. Rajesh Verma",
        "cadre": "PROFESSOR",
        "qualification": "Ph.D. Computer Science",
        "id_hash": "hash_rajesh_9921",
        "id_masked": "ABCDE****F",
        "join_date": "2024-01-15",
        "leave_date": None,
        "college_id": "COL-XYZ",
        "college_name": "XYZ Engineering College (Pune)"
    }

    # Standard clean faculty roster (35 faculty)
    clean_faculty = []
    cadres = [("PROFESSOR", "Ph.D. Computer Science")] * 5 + \
             [("ASSOCIATE PROFESSOR", "Ph.D. Information Technology")] * 10 + \
             [("ASSISTANT PROFESSOR", "M.Tech Software Engineering")] * 20
    for idx, (c, q) in enumerate(cadres, start=1):
        clean_faculty.append({
            "id": f"fac-clean-{idx}",
            "name": f"Prof. Faculty Member {idx}",
            "cadre": c,
            "qualification": q,
            "id_hash": f"hash_clean_{idx}",
            "id_masked": f"KLMNO{idx:03d}P",
            "join_date": "2023-06-01",
            "leave_date": None,
            "college_id": "COL-S1",
            "college_name": "Vellore National Institute of Technology"
        })

    # Shortfall faculty roster (25 faculty for 600 students)
    shortfall_faculty = []
    for idx in range(1, 26):
        c = "PROFESSOR" if idx <= 2 else ("ASSOCIATE PROFESSOR" if idx <= 6 else "ASSISTANT PROFESSOR")
        q = "Ph.D. Mechanical Engg" if idx <= 6 else "M.Tech Mechanical"
        shortfall_faculty.append({
            "id": f"fac-abc-{idx}",
            "name": f"Dr. Faculty {idx}",
            "cadre": c,
            "qualification": q,
            "id_hash": f"hash_abc_{idx}",
            "id_masked": f"ABCPV{idx:03d}K",
            "join_date": "2023-01-10",
            "leave_date": None,
            "college_id": "COL-S2",
            "college_name": "ABC Institute of Engineering"
        })

    # Drift faculty roster (starts 32, drops to 24 in month 8, has 2 short tenure around inspection)
    drift_faculty = []
    for idx in range(1, 25):
        drift_faculty.append({
            "id": f"fac-drift-core-{idx}",
            "name": f"Core Faculty {idx}",
            "cadre": "ASSISTANT PROFESSOR" if idx > 4 else "PROFESSOR",
            "qualification": "Ph.D. Civil Engg" if idx <= 4 else "M.Tech Civil",
            "id_hash": f"hash_drift_core_{idx}",
            "id_masked": f"DRFCD{idx:03d}Z",
            "join_date": "2024-01-01",
            "leave_date": None,
            "college_id": "COL-S5",
            "college_name": "Krishna Valley Institute"
        })
    # 8 faculty who left post-approval in June 2026
    for idx in range(25, 33):
        drift_faculty.append({
            "id": f"fac-drift-left-{idx}",
            "name": f"Resigned Faculty {idx}",
            "cadre": "ASSISTANT PROFESSOR",
            "qualification": "M.Tech Civil",
            "id_hash": f"hash_drift_left_{idx}",
            "id_masked": f"DRFLF{idx:03d}Q",
            "join_date": "2025-08-01",
            "leave_date": "2026-06-15",
            "college_id": "COL-S5",
            "college_name": "Krishna Valley Institute"
        })
    # 2 temporary faculty hired Jan 2026, resigned March 25, 2026 (Inspection was March 10, 2026)
    drift_faculty.append({
        "id": "fac-drift-temp-1",
        "name": "Prof. S. R. Deshmukh",
        "cadre": "PROFESSOR",
        "qualification": "Ph.D. Structural",
        "id_hash": "hash_temp_1",
        "id_masked": "TMP01001A",
        "join_date": "2026-01-10",
        "leave_date": "2026-03-25",
        "college_id": "COL-S5",
        "college_name": "Krishna Valley Institute"
    })
    drift_faculty.append({
        "id": "fac-drift-temp-2",
        "name": "Dr. Kavita Pillai",
        "cadre": "ASSOCIATE PROFESSOR",
        "qualification": "Ph.D. Water Resources",
        "id_hash": "hash_temp_2",
        "id_masked": "TMP02002B",
        "join_date": "2026-01-15",
        "leave_date": "2026-03-22",
        "college_id": "COL-S5",
        "college_name": "Krishna Valley Institute"
    })

    # Combined ABC roster
    combined_faculty = list(shortfall_faculty)
    combined_faculty[0] = rajesh_verma  # Inject overlapping faculty

    return {
        "S1": {
            "id": "APP-2026-S1-001",
            "scenario_name": "S1: Clean College",
            "college_name": "Vellore National Institute of Technology",
            "region": "Southern",
            "programme": "Engineering & Technology (UG)",
            "academic_year": "2026-2027",
            "state": "SCRUTINY",
            "students": 600,
            "faculty": clean_faculty,
            "land_acres": 5.2,
            "built_up_sqm": 9200.0,
            "declared_labs": 22,
            "fire_noc_expiry": "2028-06-30",
            "extracted_fire_noc": "2028-06-30",
            "doc_confidence": 0.96,
            "is_blurry": False,
            "other_system_faculty": [rajesh_matched_xyz],
            "simulated_days": 2,
            "expected_band": "GREEN",
            "expected_summary": "All regulatory standards met. Low risk."
        },
        "S2": {
            "id": "APP-2026-S2-002",
            "scenario_name": "S2: Faculty Shortfall (ABC College)",
            "college_name": "ABC Institute of Engineering & Technology",
            "region": "Northern",
            "programme": "Engineering & Technology (UG)",
            "academic_year": "2026-2027",
            "state": "SCRUTINY",
            "students": 600,
            "faculty": shortfall_faculty,
            "land_acres": 4.5,
            "built_up_sqm": 8600.0,
            "declared_labs": 20,
            "fire_noc_expiry": "2027-12-31",
            "extracted_fire_noc": "2027-12-31",
            "doc_confidence": 0.94,
            "is_blurry": False,
            "other_system_faculty": [rajesh_matched_xyz],
            "simulated_days": 3,
            "expected_band": "AMBER",
            "expected_summary": "FSR-001 FAIL: 25 recorded vs 30 required (shortfall 5)."
        },
        "S3": {
            "id": "APP-2026-S3-003",
            "scenario_name": "S3: Fire NOC Date Mismatch",
            "college_name": "Apex City College of Technology",
            "region": "Western",
            "programme": "Management (PG)",
            "academic_year": "2026-2027",
            "state": "SCRUTINY",
            "students": 360,
            "faculty": clean_faculty[:18],
            "land_acres": 4.0,
            "built_up_sqm": 8000.0,
            "declared_labs": 18,
            "fire_noc_expiry": "2026-12-31",
            "extracted_fire_noc": "2026-11-15",
            "doc_confidence": 0.92,
            "is_blurry": False,
            "other_system_faculty": [rajesh_matched_xyz],
            "simulated_days": 4,
            "expected_band": "AMBER",
            "expected_summary": "Document AI discrepancy: Declared Dec 2026, extracted Nov 2026."
        },
        "S4": {
            "id": "APP-2026-S4-004",
            "scenario_name": "S4: Duplicate PAN Overlap",
            "college_name": "Modern Polytechnic Institute",
            "region": "Central",
            "programme": "Diploma Engineering",
            "academic_year": "2026-2027",
            "state": "SCRUTINY",
            "students": 400,
            "faculty": [rajesh_verma] + clean_faculty[1:21],
            "land_acres": 4.2,
            "built_up_sqm": 8100.0,
            "declared_labs": 19,
            "fire_noc_expiry": "2027-08-31",
            "extracted_fire_noc": "2027-08-31",
            "doc_confidence": 0.95,
            "is_blurry": False,
            "other_system_faculty": [rajesh_matched_xyz],
            "simulated_days": 4,
            "expected_band": "AMBER",
            "expected_summary": "DUPLICATE_OVERLAP flag: Dr. Rajesh Verma active in 2 institutions."
        },
        "S5": {
            "id": "APP-2026-S5-005",
            "scenario_name": "S5: Post-Approval Faculty Drift",
            "college_name": "Krishna Valley Institute of Technology",
            "region": "South-West",
            "programme": "Engineering & Technology (UG)",
            "academic_year": "2025-2026",
            "state": "MONITORING",
            "students": 600,
            "faculty": drift_faculty,
            "land_acres": 5.0,
            "built_up_sqm": 9000.0,
            "declared_labs": 20,
            "fire_noc_expiry": "2027-10-15",
            "extracted_fire_noc": "2027-10-15",
            "doc_confidence": 0.97,
            "is_blurry": False,
            "other_system_faculty": [],
            "simulated_days": 0,
            "expected_band": "RED",
            "expected_summary": "Post-approval compliance drift + Short-tenure faculty cluster detected."
        },
        "S6": {
            "id": "APP-2026-S6-006",
            "scenario_name": "S6: Combined ABC College (S2+S3+S4)",
            "college_name": "ABC Institute of Technology & Management",
            "region": "Northern",
            "programme": "Engineering & Technology (UG)",
            "academic_year": "2026-2027",
            "state": "SCRUTINY",
            "students": 600,
            "faculty": combined_faculty,
            "land_acres": 4.5,
            "built_up_sqm": 8500.0,
            "declared_labs": 20,
            "fire_noc_expiry": "2026-12-31",
            "extracted_fire_noc": "2026-11-15",
            "doc_confidence": 0.93,
            "is_blurry": False,
            "other_system_faculty": [rajesh_matched_xyz],
            "simulated_days": 5,
            "expected_band": "RED",
            "expected_summary": "High risk triage: Shortfall 5 + NOC date mismatch + Concurrent PAN overlap."
        },
        "S7": {
            "id": "APP-2026-S7-007",
            "scenario_name": "S7: Unreadable Fire NOC",
            "college_name": "Suryodaya Institute of Engineering",
            "region": "Eastern",
            "programme": "Engineering & Technology (UG)",
            "academic_year": "2026-2027",
            "state": "SCRUTINY",
            "students": 480,
            "faculty": clean_faculty[:25],
            "land_acres": 4.1,
            "built_up_sqm": 8200.0,
            "declared_labs": 19,
            "fire_noc_expiry": "2027-04-10",
            "extracted_fire_noc": None,
            "doc_confidence": 0.15,
            "is_blurry": True,
            "other_system_faculty": [],
            "simulated_days": 3,
            "expected_band": "AMBER",
            "expected_summary": "Document AI UNREADABLE: blurred certificate routed to human review."
        },
        "S8": {
            "id": "APP-2026-S8-008",
            "scenario_name": "S8: SLA Breach & Escalation",
            "college_name": "Horizon College of Engineering",
            "region": "North-West",
            "programme": "Engineering & Technology (UG)",
            "academic_year": "2026-2027",
            "state": "SCRUTINY",
            "students": 600,
            "faculty": clean_faculty[:30],
            "land_acres": 4.5,
            "built_up_sqm": 8600.0,
            "declared_labs": 20,
            "fire_noc_expiry": "2027-11-20",
            "extracted_fire_noc": "2027-11-20",
            "doc_confidence": 0.95,
            "is_blurry": False,
            "other_system_faculty": [],
            "simulated_days": 13, # Exceeds 10-day SLA
            "expected_band": "GREEN",
            "expected_summary": "SLA Overdue by 3 days. Escalated to Regional Officer (Level 2)."
        }
    }
