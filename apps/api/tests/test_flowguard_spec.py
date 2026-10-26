import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_demo_reset_and_canonical_cases():
    """Verify POST /demo/reset loads all canonical seed cases (§1.3)."""
    res = client.post("/demo/reset")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True

    # Verify hero case APP-1042 Sunrise exists
    app_res = client.get("/applications/AICTE/2026/APP-1042")
    assert app_res.status_code == 200
    hero_case = app_res.json()
    assert hero_case["metadata"]["college_name"] == "Sunrise Institute of Technology"
    assert hero_case["metadata"]["status"] == "UNDER_REVIEW"
    assert hero_case["metadata"]["stage_detail"] == "TECHNICAL_SCRUTINY"
    assert len(hero_case["deficiencies"]) >= 1

def test_scoped_rbac_institution_isolation():
    """Verify Institution user only sees own applications; fixes Scope Leak (§10 #1)."""
    # Institution login: Delhi Institute of Engineering (INST-DELHI-001)
    res = client.get("/applications?role=Institution&institution_id=INST-DELHI-001")
    assert res.status_code == 200
    data = res.json()
    assert data["pagination"]["total_items"] == 0  # Zero applications initially
    assert len(data["items"]) == 0

    # Regional officer in Northern sees Northern applications
    res_reg = client.get("/applications?role=Regional+Officer&region=Northern")
    assert res_reg.status_code == 200
    reg_data = res_reg.json()
    assert reg_data["pagination"]["total_items"] >= 2  # Greenfield, National Skill, etc.

    # Administrator sees all applications
    res_admin = client.get("/applications?role=Administrator")
    assert res_admin.status_code == 200
    admin_data = res_admin.json()
    assert admin_data["pagination"]["total_items"] >= 8

def test_computed_pipeline_percentages():
    """Verify approval rate and stage percentages are computed (§10 #7)."""
    res = client.get("/applications?role=Administrator")
    assert res.status_code == 200
    p = res.json()["pipeline"]
    assert p["total"] >= 8
    assert "approval_rate_pct" in p
    assert p["stages"]["APPROVED"] >= 2  # St. Xavier's and Coastal Polytechnic
    assert p["stages"]["REJECTED"] >= 1  # National Institute of Skill Dev
    assert p["stage_percentages"]["APPROVED"] > 0

def test_compliance_self_check_preview_mode():
    """Verify POST /compliance/check runs rules in preview mode (§6.1)."""
    payload = {
        "students": 600,
        "faculty_count": 25,  # Shortfall: 25 vs 30 required
        "land_acres": 4.5,
        "built_up_sqm": 8500.0,
        "declared_labs": 20,
        "fire_noc_expiry": "2027-12-31",
        "programme": "Engineering & Technology (UG)"
    }
    res = client.post("/compliance/check", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "PREVIEW_COMPLETE"
    assert data["deficient_count"] >= 1
    # Ensure database was not modified
    app_check = client.get("/applications?role=Institution&institution_id=INST-DELHI-001")
    assert app_check.json()["pagination"]["total_items"] == 0

def test_deficiency_lifecycle():
    """Verify deficiency raise (14-day SLA) -> resubmit -> clear (§2 & §4)."""
    # 1. Raise deficiency
    raise_payload = {
        "category": "Faculty",
        "description": "Assistant Professor roster verification pending",
        "rule_id": "CAD-002",
        "handbook_clause": "AICTE APH 2024-27 Appendix 7.2",
        "required_action": "Submit certified employment register",
        "deadline_days": 14,
        "role": "Scrutiny Officer",
        "raised_by": "Dr. A. K. Sharma"
    }
    raise_res = client.post("/applications/AICTE/2026/APP-1038/deficiencies", json=raise_payload)
    assert raise_res.status_code == 200
    new_def = raise_res.json()["deficiency"]
    def_id = new_def["id"]
    assert new_def["status"] == "OPEN"

    # 2. Resubmit deficiency
    resubmit_payload = {
        "evidence_filename": "Certified_Employment_Register_2026.pdf",
        "explanation": "Uploaded certified registrar copy of faculty appointments.",
        "role": "Institution"
    }
    resub_res = client.post(f"/deficiencies/{def_id}/resubmit", json=resubmit_payload)
    assert resub_res.status_code == 200
    assert resub_res.json()["status"] == "RESUBMITTED"

    # 3. Clear deficiency
    clear_payload = {
        "officer_name": "Dr. A. K. Sharma",
        "notes": "Verified against original university service book.",
        "role": "Scrutiny Officer"
    }
    clear_res = client.post(f"/deficiencies/{def_id}/clear", json=clear_payload)
    assert clear_res.status_code == 200
    assert clear_res.json()["status"] == "CLEARED"

def test_impact_radar_critical_path():
    """Verify SETU Impact Radar ranks issues by critical path impact score (§6.4)."""
    res = client.get("/applications/AICTE/2026/APP-1042/impact")
    assert res.status_code == 200
    radar = res.json()
    assert radar["total_open_issues"] >= 1
    assert "critical_path_score" in radar
    assert len(radar["recommendations"]) >= 1
    # Check top recommendation is ordered with downstream stages
    top_rec = radar["recommendations"][0]
    assert "impact_score" in top_rec
    assert "affected_stages" in top_rec
    assert len(top_rec["affected_stages"]) > 0

def test_evc_scheduling_and_report():
    """Verify EVC workflow: schedule inspection -> submit observation report (§2 Step 3)."""
    sched_payload = {
        "scheduled_date": "2026-07-08",
        "mode": "PHYSICAL",
        "panel_members": ["Prof. Ramesh Rao (EVC Coord)", "Dr. Sunita Verma (NITK)"],
        "notes": "Verify newly constructed computing center.",
        "role": "EVC Coordinator"
    }
    sched_res = client.post("/evc/inspections?app_id=AICTE/2026/APP-1005", json=sched_payload)
    assert sched_res.status_code == 200

    report_payload = {
        "status": "RECOMMENDED_FOR_APPROVAL",
        "report_notes": "All computing terminals and licensed CAD software verified.",
        "member_name": "Dr. Sunita Verma",
        "role": "EVC Member"
    }
    rep_res = client.post("/evc/inspections/AICTE/2026/APP-1005/report", json=report_payload)
    assert rep_res.status_code == 200
    assert rep_res.json()["stage_detail"] == "COMMITTEE_HEARING"

def test_bureau_bottlenecks_analytics():
    """Verify Bureau Officer bottleneck analytics endpoint (§6 & §10)."""
    res = client.get("/analytics/bottlenecks")
    assert res.status_code == 200
    data = res.json()
    assert "total_active_bottlenecks" in data
    assert len(data["bottlenecks"]) >= 1

def test_cryptographic_audit_chain_verification():
    """Verify SHA-256 hash chain verification endpoint (§6.5)."""
    res = client.get("/audit/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["valid"] is True
    assert "latest_block_hash" in data
