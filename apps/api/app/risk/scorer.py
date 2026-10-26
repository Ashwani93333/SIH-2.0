from typing import List, Dict, Any

DEFAULT_WEIGHTS = {
    "FSR_FAIL": 25,
    "CADRE_FAIL": 10,
    "QUAL_FAIL": 15,
    "LAND_FAIL": 20,
    "LAB_FAIL": 10,
    "CERT_EXPIRED": 25,
    "CERT_EXPIRING_SOON": 8,
    "FIRE_NOC_MISMATCH": 22,
    "FIRE_NOC_UNREADABLE": 14,
    "FIRE_NOC_LOW_CONFIDENCE": 8,
    "DUPLICATE_OVERLAP": 25,
    "DUPLICATE_SEQUENTIAL": 5,
    "DRIFT_BELOW_REQUIREMENT": 18,
    "SHORT_TENURE_CLUSTER": 12,
    "MISSING_EVIDENCE": 10,
}

SEVERITY_FACTORS = {
    "LOW": 0.5,
    "MEDIUM": 1.0,
    "HIGH": 1.5,
}

def calculate_risk_score(flags: List[Dict[str, Any]], weights: Dict[str, float] = None) -> Dict[str, Any]:
    active_weights = weights or DEFAULT_WEIGHTS
    
    breakdown = []
    total_raw_score = 0.0

    for flag in flags:
        flag_type = flag.get("flag_type", "UNKNOWN")
        severity = flag.get("severity", "MEDIUM")
        confidence = float(flag.get("confidence", 1.0))
        base_weight = active_weights.get(flag_type, 10)
        sev_factor = SEVERITY_FACTORS.get(severity, 1.0)
        
        contribution = base_weight * sev_factor * confidence
        total_raw_score += contribution

        breakdown.append({
            "flag_type": flag_type,
            "title": flag.get("title", flag_type.replace("_", " ").title()),
            "severity": severity,
            "confidence": round(confidence, 2),
            "contribution": round(contribution, 1),
            "explanation": flag.get("explanation", ""),
            "evidence": flag.get("evidence")
        })

    # Sort breakdown by contribution descending
    breakdown.sort(key=lambda x: x["contribution"], reverse=True)

    final_score = min(100, int(round(total_raw_score)))

    if final_score < 30:
        band = "GREEN"
        summary = "Low Regulatory Risk: Institution largely adheres to baseline compliance criteria."
    elif final_score < 60:
        band = "AMBER"
        summary = "Moderate Risk: Identified deficiencies or discrepancies warrant detailed scrutiny review."
    else:
        band = "RED"
        summary = "High Risk / Scrutiny Escalation: Critical shortfalls or conflicting records identified across multiple verification layers."

    top_reasons = breakdown[:3]

    return {
        "risk_score": final_score,
        "risk_band": band,
        "summary": summary,
        "top_reasons": top_reasons,
        "all_contributing_factors": breakdown,
        "weights_version": 1,
        "disclaimer": "Statutory Advisory Notice: Risk scores and classifications are algorithmic triage aids. They do not constitute statutory approval or refusal, which remains exclusively within the authority of appointed AICTE committees."
    }
