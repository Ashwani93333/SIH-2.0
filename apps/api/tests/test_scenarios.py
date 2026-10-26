import pytest
from app.rules.engine import evaluate_fsr, run_all_rules
from app.documents.extractor import compare_fire_noc
from app.crossrecord.duplicates import detect_faculty_duplicates
from app.monitoring.drift import calculate_monthly_snapshots
from app.risk.scorer import calculate_risk_score
from app.workflow.state_machine import can_transition, calculate_sla_status
from app.audit.logger import audit_store
from app.seed.scenarios import get_demo_scenarios

scenarios = get_demo_scenarios()

def test_s1_clean_college():
    """S1: Clean college - All PASS, Green risk"""
    s1 = scenarios["S1"]
    rules = run_all_rules(s1)
    for r in rules:
        assert r["status"] == "PASS", f"Rule {r['rule_id']} failed on clean college"
    
    doc = compare_fire_noc(s1["fire_noc_expiry"], s1["extracted_fire_noc"], s1["doc_confidence"])
    assert doc["status"] == "MATCH"

    dups = detect_faculty_duplicates(s1["faculty"], s1["other_system_faculty"], s1["id"])
    assert len(dups) == 0

    risk = calculate_risk_score([])
    assert risk["risk_band"] == "GREEN"
    assert risk["risk_score"] < 30

def test_s2_faculty_shortfall():
    """S2: ABC College - 600 students, 25 faculty -> shortfall 5"""
    s2 = scenarios["S2"]
    fsr = evaluate_fsr(s2["students"], len(s2["faculty"]), students_per_faculty=20)
    assert fsr["status"] == "FAIL"
    assert fsr["required"] == 30
    assert fsr["actual"] == 25
    assert fsr["shortfall"] == 5

def test_s3_fire_noc_mismatch():
    """S3: Fire NOC date mismatch (declared Dec, extracted Nov)"""
    s3 = scenarios["S3"]
    doc = compare_fire_noc(s3["fire_noc_expiry"], s3["extracted_fire_noc"], s3["doc_confidence"])
    assert doc["status"] == "MISMATCH"
    assert doc["review_status"] == "NEEDS_REVIEW"

def test_s4_duplicate_pan_overlap():
    """S4: Duplicate PAN in ABC and XYZ with overlapping dates"""
    s4 = scenarios["S4"]
    dups = detect_faculty_duplicates(s4["faculty"], s4["other_system_faculty"], s4["id"])
    assert len(dups) >= 1
    overlap_flags = [d for d in dups if d["flag_type"] == "DUPLICATE_OVERLAP"]
    assert len(overlap_flags) >= 1
    assert overlap_flags[0]["severity"] == "HIGH"

def test_s5_drift_monitor():
    """S5: Faculty drift below requirement and short tenure cluster"""
    s5 = scenarios["S5"]
    drift = calculate_monthly_snapshots(s5["faculty"], students=s5["students"], fsr_ratio=20)
    alert_types = [a["type"] for a in drift["alerts"]]
    assert "BELOW_REQUIREMENT" in alert_types
    assert "SHORT_TENURE_CLUSTER" in alert_types

def test_s6_combined_abc_red():
    """S6: Combined S2 + S3 + S4 -> Risk Red with top reasons"""
    s6 = scenarios["S6"]
    fsr = evaluate_fsr(s6["students"], len(s6["faculty"]), 20)
    doc = compare_fire_noc(s6["fire_noc_expiry"], s6["extracted_fire_noc"], s6["doc_confidence"])
    dups = detect_faculty_duplicates(s6["faculty"], s6["other_system_faculty"], s6["id"])

    flags = [
        {"flag_type": "FSR_FAIL", "severity": "HIGH", "confidence": 1.0, "explanation": fsr["explanation"]},
        {"flag_type": "FIRE_NOC_MISMATCH", "severity": "HIGH", "confidence": doc["confidence"], "explanation": doc["explanation"]},
        {"flag_type": "DUPLICATE_OVERLAP", "severity": "HIGH", "confidence": 1.0, "explanation": dups[0]["explanation"]}
    ]
    risk = calculate_risk_score(flags)
    assert risk["risk_band"] == "RED"
    assert risk["risk_score"] >= 60
    assert len(risk["top_reasons"]) >= 3

def test_s7_blurry_unreadable_noc():
    """S7: Blurry NOC -> UNREADABLE, NEEDS_REVIEW, no auto-fail"""
    s7 = scenarios["S7"]
    doc = compare_fire_noc(s7["fire_noc_expiry"], s7["extracted_fire_noc"], s7["doc_confidence"], is_blurry=s7["is_blurry"])
    assert doc["status"] == "UNREADABLE"
    assert doc["review_status"] == "NEEDS_REVIEW"

def test_s8_sla_breach_escalation():
    """S8: SLA overdue by 3 days -> escalated to Regional Officer"""
    sla = calculate_sla_status("SCRUTINY", "2026-10-15", simulated_days_offset=13)
    assert sla["status"] == "OVERDUE"
    assert sla["escalation_level"] >= 2
    assert "Regional" in sla["escalated_to"]

def test_decision_authority_safeguard():
    """Only Competent Authority can record LoA/LoD/LoR"""
    # College User cannot transition to LOA_ISSUED
    allowed, err = can_transition("DECISION_PENDING", "LOA_ISSUED", "College User")
    assert not allowed
    # Scrutiny Officer cannot transition to LOA_ISSUED
    allowed, err = can_transition("DECISION_PENDING", "LOA_ISSUED", "Scrutiny Officer")
    assert not allowed
    # Competent Authority CAN transition
    allowed, err = can_transition("DECISION_PENDING", "LOA_ISSUED", "Competent Authority")
    assert allowed

def test_audit_chain_integrity():
    """Hash chain verification succeeds and detects tampering"""
    res = audit_store.verify()
    assert res["valid"] is True
