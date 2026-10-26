import os
import json
import csv
from typing import Dict, Any, List

SCENARIOS_DIR = os.path.join(os.path.dirname(__file__), "scenarios")

def ensure_scenario_folders():
    os.makedirs(SCENARIOS_DIR, exist_ok=True)
    
    # 8 Canonical Stories as defined in SETU_PROCESS_SPEC.md §1.3 & §9
    scenarios_data = {
        "APP-1042_Sunrise": {
            "scenario": {
                "key": "APP-1042",
                "id": "AICTE/2026/APP-1042",
                "case_id": "AICTE/2026/APP-1042",
                "institution_id": "INST-SUNRISE-1042",
                "college_name": "Sunrise Institute of Technology",
                "scenario_name": "Sunrise Institute of Technology (Hero Case: Red Risk)",
                "region": "Western (Mumbai)",
                "city": "Mumbai",
                "type": "New Approval",
                "programme": "Engineering & Technology (UG)",
                "academic_year": "2026-2027",
                "submitted_at": "2026-06-15",
                "status": "UNDER_REVIEW",
                "stage_detail": "TECHNICAL_SCRUTINY",
                "assigned_officer_id": "OFF-RAJESHWARI",
                "assigned_officer_name": "Rajeshwari Nair",
                "second_reviewer_name": "Dr. A. K. Sharma",
                "dual_scrutiny_status": "FIRST_REVIEW_COMPLETE",
                "stage_started_at": "2026-06-16",
                "due_at": "2026-06-30",
                "students": 600,
                "land_acres": 4.5,
                "built_up_sqm": 8500.0,
                "declared_labs": 20,
                "fire_noc_expiry": "2026-12-31",
                "extracted_fire_noc": "2026-11-15",
                "doc_confidence": 0.93,
                "is_blurry": False,
                "simulated_days": 5,
                "expected_band": "RED",
                "expected_summary": "Hero case: Cadre shortfall of 2 Associate Professors + Fire NOC mismatch + Cross-record overlap.",
                "deficiencies": [
                    {
                        "id": "DEF-1042-01",
                        "category": "Faculty",
                        "description": "Cadre shortfall of 2 Associate Professors in Computer Science",
                        "rule_id": "CAD-002",
                        "handbook_clause": "AICTE APH 2024-27 Appendix 7.2",
                        "required_action": "Submit certified recruitment notifications or approved selection board roster",
                        "deadline": "2026-07-02",
                        "status": "OPEN",
                        "raised_by": "Rajeshwari Nair",
                        "cleared_by": None
                    }
                ],
                "evc_inspection": None,
                "committee_hearing": None,
                "final_decision": None
            },
            "faculty_count": 28,
            "inject_pan_duplicate": True,
            "cadre_shortfall": 2
        },
        "APP-1038_Greenfield": {
            "scenario": {
                "key": "APP-1038",
                "id": "AICTE/2026/APP-1038",
                "case_id": "AICTE/2026/APP-1038",
                "institution_id": "INST-GREENFIELD-1038",
                "college_name": "Greenfield College of Engineering",
                "scenario_name": "Greenfield College of Engineering (Clean Case: Green Risk)",
                "region": "Northern (Kanpur)",
                "city": "Kanpur",
                "type": "Renewal",
                "programme": "Engineering & Technology (UG)",
                "academic_year": "2026-2027",
                "submitted_at": "2026-06-10",
                "status": "COMMITTEE",
                "stage_detail": "COMMITTEE_HEARING",
                "assigned_officer_id": "OFF-SHARMA",
                "assigned_officer_name": "Dr. A. K. Sharma",
                "second_reviewer_name": "Dr. R. K. Singhania",
                "dual_scrutiny_status": "DUAL_CONFIRMED",
                "stage_started_at": "2026-06-26",
                "due_at": "2026-07-06",
                "students": 600,
                "land_acres": 5.5,
                "built_up_sqm": 9200.0,
                "declared_labs": 24,
                "fire_noc_expiry": "2028-06-30",
                "extracted_fire_noc": "2028-06-30",
                "doc_confidence": 0.98,
                "is_blurry": False,
                "simulated_days": 2,
                "expected_band": "GREEN",
                "expected_summary": "Clean case: 0 deficiencies, EVC verified, Standing Hearing Committee Batch B.",
                "deficiencies": [],
                "evc_inspection": {
                    "scheduled_date": "2026-06-25",
                    "mode": "PHYSICAL",
                    "panel_members": ["Prof. H. R. Venkatesh (IITD)", "Dr. Sunita Sen (NITK)"],
                    "checklist_status": "VERIFIED_ALL",
                    "report_status": "RECOMMENDED_FOR_APPROVAL",
                    "status": "COMPLETED",
                    "report_notes": "Campus infrastructure, physical laboratories, and cadre strength verified as per APH norms."
                },
                "committee_hearing": {
                    "committee_name": "Standing Hearing Committee Batch B",
                    "hearing_date": "2026-07-02",
                    "status": "PENDING_RECOMMENDATION"
                },
                "final_decision": None
            },
            "faculty_count": 35,
            "inject_pan_duplicate": False,
            "cadre_shortfall": 0
        },
        "APP-1035_StXaviers": {
            "scenario": {
                "key": "APP-1035",
                "id": "AICTE/2026/APP-1035",
                "case_id": "AICTE/2026/APP-1035",
                "institution_id": "INST-STXAVIER-1035",
                "college_name": "St. Xavier's Technical Campus",
                "scenario_name": "St. Xavier's Technical Campus (Approved)",
                "region": "Western (Mumbai)",
                "city": "Mumbai",
                "type": "New Approval",
                "programme": "Management (PG)",
                "academic_year": "2026-2027",
                "submitted_at": "2026-06-05",
                "status": "APPROVED",
                "stage_detail": "FINAL_DECISION",
                "assigned_officer_id": "OFF-RAJESHWARI",
                "assigned_officer_name": "Rajeshwari Nair",
                "second_reviewer_name": "Dr. A. K. Sharma",
                "dual_scrutiny_status": "DUAL_CONFIRMED",
                "stage_started_at": "2026-06-28",
                "due_at": "2026-06-30",
                "students": 360,
                "land_acres": 4.2,
                "built_up_sqm": 8200.0,
                "declared_labs": 18,
                "fire_noc_expiry": "2028-05-15",
                "extracted_fire_noc": "2028-05-15",
                "doc_confidence": 0.97,
                "is_blurry": False,
                "simulated_days": 0,
                "expected_band": "GREEN",
                "expected_summary": "Statutory Letter of Approval (LOA) issued by Member Secretary.",
                "deficiencies": [],
                "evc_inspection": {
                    "scheduled_date": "2026-06-18",
                    "mode": "PHYSICAL",
                    "panel_members": ["Dr. K. G. Bhole", "Prof. M. R. Joshi"],
                    "status": "COMPLETED",
                    "report_notes": "All requirements compliant."
                },
                "committee_hearing": {
                    "committee_name": "Standing Hearing Committee Batch A",
                    "recommendation": "GRANT_APPROVAL"
                },
                "final_decision": {
                    "type": "LOA_ISSUED",
                    "authority": "Prof. Rajive Kumar, Member Secretary",
                    "note": "Letter of Approval granted for Academic Year 2026-2027 under APH Clause 3.2.",
                    "signed_at": "2026-06-28T14:30:00Z",
                    "certificate_qr": "VERIFY-AICTE-2026-APP-1035-HASH-883F"
                }
            },
            "faculty_count": 22,
            "inject_pan_duplicate": False,
            "cadre_shortfall": 0
        },
        "APP-1029_NationalSkill": {
            "scenario": {
                "key": "APP-1029",
                "id": "AICTE/2026/APP-1029",
                "case_id": "AICTE/2026/APP-1029",
                "institution_id": "INST-NATSKILL-1029",
                "college_name": "National Institute of Skill Development",
                "scenario_name": "National Institute of Skill Development (Rejected: Land Deficit)",
                "region": "Northern (Lucknow)",
                "city": "Lucknow",
                "type": "Extension",
                "programme": "Vocational & Applied Tech",
                "academic_year": "2026-2027",
                "submitted_at": "2026-05-28",
                "status": "REJECTED",
                "stage_detail": "FINAL_DECISION",
                "assigned_officer_id": "OFF-SHARMA",
                "assigned_officer_name": "Dr. A. K. Sharma",
                "second_reviewer_name": "Dr. R. K. Singhania",
                "stage_started_at": "2026-06-18",
                "due_at": "2026-06-20",
                "students": 480,
                "land_acres": 2.1,
                "built_up_sqm": 4200.0,
                "declared_labs": 14,
                "fire_noc_expiry": "2027-02-15",
                "extracted_fire_noc": "2027-02-15",
                "doc_confidence": 0.95,
                "is_blurry": False,
                "simulated_days": 10,
                "expected_band": "RED",
                "expected_summary": "Rejected by committee for unaddressed land norms deficit DEF-1029-01.",
                "deficiencies": [
                    {
                        "id": "DEF-1029-01",
                        "category": "Infrastructure",
                        "description": "Non-contiguous land parcel and title deed shortfall",
                        "rule_id": "LND-004",
                        "handbook_clause": "AICTE APH 2024-27 Chapter 1 Clause 1.4",
                        "required_action": "Provide municipal NOC or consolidation title deed",
                        "deadline": "2026-06-16",
                        "status": "OPEN",
                        "raised_by": "Dr. A. K. Sharma",
                        "cleared_by": None
                    }
                ],
                "evc_inspection": {
                    "scheduled_date": "2026-06-08",
                    "mode": "PHYSICAL",
                    "panel_members": ["Dr. O. P. Tiwari", "Prof. R. C. Gupta"],
                    "status": "COMPLETED",
                    "report_notes": "Land parcel bifurcated by public road without contiguous boundary wall."
                },
                "committee_hearing": {
                    "committee_name": "Standing Hearing Committee Batch C",
                    "recommendation": "REFUSE_APPROVAL"
                },
                "final_decision": {
                    "type": "LOR_ISSUED",
                    "authority": "Prof. T. G. Sitharam, Chairman",
                    "note": "Letter of Rejection issued: Deficiencies in land norms remained unresolved past deadline.",
                    "signed_at": "2026-06-19T11:00:00Z"
                }
            },
            "faculty_count": 25,
            "inject_pan_duplicate": False,
            "cadre_shortfall": 0
        },
        "APP-1022_Rural": {
            "scenario": {
                "key": "APP-1022",
                "id": "AICTE/2026/APP-1022",
                "case_id": "AICTE/2026/APP-1022",
                "institution_id": "INST-RURAL-1022",
                "college_name": "Rural Engineering College",
                "scenario_name": "Rural Engineering College (Submitted: Unassigned 48h Queue)",
                "region": "South-West (Bengaluru)",
                "city": "Bengaluru",
                "type": "New Approval",
                "programme": "Engineering & Technology (UG)",
                "academic_year": "2026-2027",
                "submitted_at": "2026-05-20",
                "status": "SUBMITTED",
                "stage_detail": "INTAKE",
                "assigned_officer_id": None,
                "assigned_officer_name": "Unassigned",
                "second_reviewer_name": None,
                "dual_scrutiny_status": "PENDING_ASSIGNMENT",
                "stage_started_at": "2026-05-20",
                "due_at": "2026-05-22",
                "students": 420,
                "land_acres": 6.0,
                "built_up_sqm": 8800.0,
                "declared_labs": 18,
                "fire_noc_expiry": "2027-11-30",
                "extracted_fire_noc": "2027-11-30",
                "doc_confidence": 0.94,
                "is_blurry": False,
                "simulated_days": 3,
                "expected_band": "AMBER",
                "expected_summary": "Unassigned casework in intake queue; SLA allocation warning (>48 hours).",
                "deficiencies": [],
                "evc_inspection": None,
                "committee_hearing": None,
                "final_decision": None
            },
            "faculty_count": 22,
            "inject_pan_duplicate": False,
            "cadre_shortfall": 0
        },
        "APP-1018_Metropolitan": {
            "scenario": {
                "key": "APP-1018",
                "id": "AICTE/2026/APP-1018",
                "case_id": "AICTE/2026/APP-1018",
                "institution_id": "INST-METRO-1018",
                "college_name": "Metropolitan Institute of Management",
                "scenario_name": "Metropolitan Institute of Management (Resubmitted Deficiency)",
                "region": "Central (Bhopal)",
                "city": "Bhopal",
                "type": "Renewal",
                "programme": "Management & Computer Applications",
                "academic_year": "2026-2027",
                "submitted_at": "2026-05-12",
                "status": "UNDER_REVIEW",
                "stage_detail": "TECHNICAL_SCRUTINY",
                "assigned_officer_id": "OFF-ANANYA",
                "assigned_officer_name": "Dr. Ananya Sharma",
                "second_reviewer_name": "Shri Vikram Malhotra",
                "dual_scrutiny_status": "RESUBMISSION_VERIFICATION",
                "stage_started_at": "2026-05-14",
                "due_at": "2026-06-05",
                "students": 300,
                "land_acres": 4.0,
                "built_up_sqm": 7500.0,
                "declared_labs": 16,
                "fire_noc_expiry": "2027-09-30",
                "extracted_fire_noc": "2027-09-30",
                "doc_confidence": 0.96,
                "is_blurry": False,
                "simulated_days": 8,
                "expected_band": "AMBER",
                "expected_summary": "Financial & Legal deficiency resubmitted by institution; awaiting scrutiny verification.",
                "deficiencies": [
                    {
                        "id": "DEF-1018-01",
                        "category": "Financial & Legal",
                        "description": "Endowment fund FDR lien certificate missing official registration stamp",
                        "rule_id": "FDR-005",
                        "handbook_clause": "AICTE APH 2024-27 Clause 2.11",
                        "required_action": "Upload bank certified lien certificate with registrar digital signet",
                        "deadline": "2026-06-02",
                        "status": "RESUBMITTED",
                        "raised_by": "Dr. Ananya Sharma",
                        "cleared_by": None,
                        "evidence": "FDR_Lien_Stamped_Resubmission.pdf"
                    }
                ],
                "evc_inspection": None,
                "committee_hearing": None,
                "final_decision": None
            },
            "faculty_count": 18,
            "inject_pan_duplicate": False,
            "cadre_shortfall": 0
        },
        "APP-1010_Coastal": {
            "scenario": {
                "key": "APP-1010",
                "id": "AICTE/2026/APP-1010",
                "case_id": "AICTE/2026/APP-1010",
                "institution_id": "INST-COASTAL-1010",
                "college_name": "Coastal Polytechnic",
                "scenario_name": "Coastal Polytechnic (Approved LOA)",
                "region": "Southern (Chennai)",
                "city": "Chennai",
                "type": "New Approval",
                "programme": "Diploma Engineering",
                "academic_year": "2026-2027",
                "submitted_at": "2026-04-30",
                "status": "APPROVED",
                "stage_detail": "FINAL_DECISION",
                "assigned_officer_id": "OFF-VENKAT",
                "assigned_officer_name": "Dr. K. Venkatraman",
                "second_reviewer_name": "Dr. R. K. Singhania",
                "stage_started_at": "2026-05-25",
                "due_at": "2026-05-30",
                "students": 360,
                "land_acres": 4.8,
                "built_up_sqm": 7900.0,
                "declared_labs": 18,
                "fire_noc_expiry": "2028-04-20",
                "extracted_fire_noc": "2028-04-20",
                "doc_confidence": 0.97,
                "is_blurry": False,
                "simulated_days": 0,
                "expected_band": "GREEN",
                "expected_summary": "Full grant of LOA approved by Authority.",
                "deficiencies": [],
                "evc_inspection": {
                    "scheduled_date": "2026-05-12",
                    "mode": "PHYSICAL",
                    "panel_members": ["Dr. S. Swaminathan", "Prof. P. Balan"],
                    "status": "COMPLETED"
                },
                "committee_hearing": {
                    "committee_name": "Standing Hearing Committee Batch A",
                    "recommendation": "GRANT_APPROVAL"
                },
                "final_decision": {
                    "type": "LOA_ISSUED",
                    "authority": "Prof. Rajive Kumar, Member Secretary",
                    "note": "LOA issued after unanimous EVC & Hearing Committee clearance.",
                    "signed_at": "2026-05-28T16:00:00Z"
                }
            },
            "faculty_count": 20,
            "inject_pan_duplicate": False,
            "cadre_shortfall": 0
        },
        "APP-1005_Hilltop": {
            "scenario": {
                "key": "APP-1005",
                "id": "AICTE/2026/APP-1005",
                "case_id": "AICTE/2026/APP-1005",
                "institution_id": "INST-HILLTOP-1005",
                "college_name": "Hilltop College of Engineering",
                "scenario_name": "Hilltop College of Engineering (EVC In-Progress)",
                "region": "North-West (Chandigarh)",
                "city": "Chandigarh",
                "type": "Extension",
                "programme": "Engineering & Technology (UG)",
                "academic_year": "2026-2027",
                "submitted_at": "2026-04-22",
                "status": "COMMITTEE",
                "stage_detail": "EVC_VISIT",
                "assigned_officer_id": "OFF-MANOJ",
                "assigned_officer_name": "Dr. Manoj Gill",
                "second_reviewer_name": "Dr. A. K. Sharma",
                "dual_scrutiny_status": "ORDER_EVC_APPROVED",
                "stage_started_at": "2026-06-15",
                "due_at": "2026-07-05",
                "students": 600,
                "land_acres": 5.0,
                "built_up_sqm": 8900.0,
                "declared_labs": 22,
                "fire_noc_expiry": "2027-10-10",
                "extracted_fire_noc": "2027-10-10",
                "doc_confidence": 0.95,
                "is_blurry": False,
                "simulated_days": 6,
                "expected_band": "AMBER",
                "expected_summary": "Executive Committee Expert Panel scheduled; expert panel empanelment in progress.",
                "deficiencies": [],
                "evc_inspection": {
                    "scheduled_date": "2026-06-29",
                    "mode": "PHYSICAL",
                    "panel_members": [],
                    "status": "PANEL_EMPANELMENT_IN_PROGRESS",
                    "report_notes": "Expert Panel nomination submitted to EVC Coordinator."
                },
                "committee_hearing": {
                    "committee_name": "Executive Committee Expert Panel",
                    "status": "AWAITING_EVC_REPORT"
                },
                "final_decision": None
            },
            "faculty_count": 31,
            "inject_pan_duplicate": False,
            "cadre_shortfall": 0
        }
    }

    # Common shared duplicate faculty: Dr. Rajesh Verma
    rajesh_verma = {
        "id": "fac-101",
        "name": "Dr. Rajesh Verma",
        "cadre": "PROFESSOR",
        "qualification": "Ph.D. Computer Science",
        "id_hash": "hash_rajesh_9921",
        "id_masked": "ABCDE****F",
        "join_date": "2024-07-01",
        "leave_date": None,
        "college_id": "AICTE/2026/APP-1042",
        "college_name": "Sunrise Institute of Technology"
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

    for folder_name, data in scenarios_data.items():
        folder_path = os.path.join(SCENARIOS_DIR, folder_name)
        os.makedirs(folder_path, exist_ok=True)
        docs_path = os.path.join(folder_path, "documents")
        os.makedirs(docs_path, exist_ok=True)

        scen = data["scenario"]
        count = data["faculty_count"]

        # Generate faculty roster
        faculty = []
        for i in range(1, count + 1):
            cadre = "PROFESSOR" if i <= max(2, count // 7) else ("ASSOCIATE PROFESSOR" if i <= max(4, count // 3) else "ASSISTANT PROFESSOR")
            qual = "Ph.D. Computer Science" if "PROFESSOR" in cadre else "M.Tech Engineering"
            faculty.append({
                "id": f"fac-{scen['key']}-{i}",
                "name": f"Faculty Member {i} ({scen['key']})",
                "cadre": cadre,
                "qualification": qual,
                "id_hash": f"hash_{scen['key']}_{i}",
                "id_masked": f"PAN{scen['key'][:3]}{i:03d}X",
                "join_date": "2023-06-01",
                "leave_date": None,
                "college_id": scen["id"],
                "college_name": scen["college_name"]
            })

        if data.get("inject_pan_duplicate") and len(faculty) > 0:
            faculty[0] = rajesh_verma

        scen["faculty"] = faculty
        scen["other_system_faculty"] = [rajesh_matched_xyz] if data.get("inject_pan_duplicate") else []

        # Write scenario.json
        with open(os.path.join(folder_path, "scenario.json"), "w", encoding="utf-8") as f:
            json.dump(scen, f, indent=2)

        # Write faculty_roster.csv
        with open(os.path.join(folder_path, "faculty_roster.csv"), "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow(["ID", "Name", "Cadre", "Qualification", "Masked_ID", "Join_Date", "Leave_Date"])
            for fac in faculty:
                writer.writerow([fac["id"], fac["name"], fac["cadre"], fac["qualification"], fac["id_masked"], fac["join_date"], fac.get("leave_date") or ""])

        # Write sample PDF/document text metadata
        doc_meta = {
            "document_name": "Fire_Safety_NOC.pdf",
            "sha256": f"hash_{scen['key']}_fire_noc_2026",
            "issuing_authority": "Directorate of Fire & Emergency Services",
            "declared_expiry": scen["fire_noc_expiry"],
            "extracted_expiry": scen["extracted_fire_noc"],
            "confidence": scen["doc_confidence"],
            "is_blurry": scen["is_blurry"],
            "clause": "AICTE APH 2024-27 Clause 2.3.4"
        }
        with open(os.path.join(docs_path, "Fire_Safety_NOC_meta.json"), "w", encoding="utf-8") as f:
            json.dump(doc_meta, f, indent=2)

def load_all_scenarios() -> Dict[str, Dict[str, Any]]:
    ensure_scenario_folders()
    result = {}

    for item in os.listdir(SCENARIOS_DIR):
        folder = os.path.join(SCENARIOS_DIR, item)
        scen_json = os.path.join(folder, "scenario.json")
        if os.path.isdir(folder) and os.path.exists(scen_json):
            try:
                with open(scen_json, "r", encoding="utf-8") as f:
                    scen_obj = json.load(f)
                    key = scen_obj.get("key", item)
                    result[key] = scen_obj
                    # Also index by canonical case_id
                    result[scen_obj["id"]] = scen_obj
            except Exception as e:
                print(f"Error loading {scen_json}: {e}")

    # Aliases for backward compatibility with tests (S1-S8)
    aliases = {
        "S1": "APP-1038", # Clean Greenfield
        "S2": "APP-1042", # Shortfall Sunrise
        "S3": "APP-1042", # Date mismatch
        "S4": "APP-1042", # Duplicate PAN overlap
        "S6": "APP-1042", # Hero combined Red
        "S5": "S5",       # Drift monitor Krishna Valley
        "S7": "S7",       # Blurry NOC
        "S8": "APP-1022"  # SLA unassigned / breach
    }
    
    # Also load original S5, S7 if not present
    from app.seed.scenarios import get_demo_scenarios
    original_demos = get_demo_scenarios()
    for orig_key in ["S5", "S7", "S8"]:
        if orig_key not in result and orig_key in original_demos:
            result[orig_key] = original_demos[orig_key]

    for alias, target in aliases.items():
        if target in result:
            result[alias] = result[target]

    return result
