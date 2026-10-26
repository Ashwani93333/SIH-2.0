"""
SETU Impact Radar: Regulatory Dependency & Critical Path Analysis Engine
Section 6.4 of SETU Process Specification.

Analyzes bottlenecks, maps issues to downstream statutory stages, 
computes impact scores, groups root causes, and recommends high-leverage resolution actions.
"""
from typing import Dict, Any, List, Set

# Regulatory Dependency Graph (DAG)
# A -> B means A blocks or affects B
DEPENDENCY_GRAPH = {
    "CADRE_SHORTFALL": ["FSR_RULE", "TECHNICAL_SCRUTINY"],
    "FACULTY_VERIFICATION": ["FSR_RULE", "TECHNICAL_SCRUTINY"],
    "FSR_RULE": ["EVC_VISIT", "COMMITTEE_HEARING"],
    "LAND_NORMS": ["EVC_VISIT", "COMMITTEE_HEARING", "FINAL_DECISION"],
    "FIRE_NOC": ["FINAL_DECISION"],
    "FDR_LIEN": ["FINAL_DECISION"],
    "DUPLICATE_PAN": ["FACULTY_VERIFICATION", "TECHNICAL_SCRUTINY"],
    "EVC_VISIT": ["COMMITTEE_HEARING"],
    "COMMITTEE_HEARING": ["FINAL_DECISION"],
}

# Statutory stage importance weights (Section 6.4)
STAGE_WEIGHTS = {
    "INTAKE_DECISION": 1.0,
    "TECHNICAL_SCRUTINY": 1.5,
    "EVC_VISIT": 2.0,
    "COMMITTEE_HEARING": 2.5,
    "FINAL_DECISION": 3.0
}

SEVERITY_WEIGHTS = {
    "HIGH": 3.0,
    "CRITICAL": 3.5,
    "MEDIUM": 2.0,
    "LOW": 1.0
}

def get_downstream_stages(issue_node: str) -> List[str]:
    """Perform BFS/DFS traversal on DAG to find all reachable downstream stages."""
    visited: Set[str] = set()
    queue = [issue_node]
    stages_hit = []

    while queue:
        current = queue.pop(0)
        children = DEPENDENCY_GRAPH.get(current, [])
        for child in children:
            if child not in visited:
                visited.add(child)
                queue.append(child)
                if child in STAGE_WEIGHTS:
                    stages_hit.append(child)
    
    return sorted(list(set(stages_hit)), key=lambda s: STAGE_WEIGHTS.get(s, 0))

def compute_impact_radar(application: Dict[str, Any], sim_days: int = 0) -> Dict[str, Any]:
    """
    Computes Impact Radar recommendations for an application based on open issues,
    deficiencies, and risk flags.
    """
    deficiencies = application.get("deficiencies", [])
    open_issues = []
    
    # 1. Parse active deficiencies
    for d in deficiencies:
        if d.get("status", "OPEN") in ["OPEN", "RESUBMITTED"]:
            cat = d.get("category", "").upper()
            node_key = "LAND_NORMS" if "INFRA" in cat or "LAND" in cat else (
                "CADRE_SHORTFALL" if "FACULTY" in cat or "CADRE" in cat else (
                    "FIRE_NOC" if "FIRE" in cat or "SAFETY" in cat else (
                        "FDR_LIEN" if "FINANCIAL" in cat or "LEGAL" in cat else "TECHNICAL_SCRUTINY"
                    )
                )
            )
            open_issues.append({
                "id": d.get("id", "DEF-01"),
                "category": d.get("category", "General"),
                "node_key": node_key,
                "title": d.get("description", "Statutory Deficit"),
                "severity": "HIGH" if "land" in d.get("description", "").lower() or "cadre" in d.get("description", "").lower() else "MEDIUM",
                "required_action": d.get("required_action", "Provide rectification evidence"),
                "rule_ref": d.get("handbook_clause", d.get("rule_id", "AICTE APH 2024-27")),
                "deadline": d.get("deadline", "14 business days")
            })

    # 2. Parse Fire NOC mismatch if present
    if application.get("extracted_fire_noc") and application.get("fire_noc_expiry"):
        if application.get("extracted_fire_noc") != application.get("fire_noc_expiry"):
            open_issues.append({
                "id": "DOC-FIRE-01",
                "category": "Safety & Statutory NOC",
                "node_key": "FIRE_NOC",
                "title": f"Fire NOC Expiry Discrepancy (Declared: {application.get('fire_noc_expiry')}, Extracted: {application.get('extracted_fire_noc')})",
                "severity": "HIGH",
                "required_action": "Upload authenticated State Fire Directorate extension letter",
                "rule_ref": "AICTE APH 2024-27 Appendix 4 Clause 4.1",
                "deadline": "Immediate / Before Final Sign-Off"
            })

    # Calculate urgency multiplier based on SLA days elapsed
    days_elapsed = application.get("simulated_days", 0) + sim_days
    urgency = 1.0 + (days_elapsed / 14.0)

    recommendations = []
    total_unblocked = 0

    for idx, issue in enumerate(open_issues, start=1):
        downstream = get_downstream_stages(issue["node_key"])
        sev_weight = SEVERITY_WEIGHTS.get(issue["severity"], 1.5)
        
        # Stage importance sum
        stage_sum = sum(STAGE_WEIGHTS.get(st, 1.0) for st in downstream) if downstream else 1.0
        unblocked_count = len(downstream) + 1
        total_unblocked += unblocked_count

        # Score formula: severity * stage_importance * unblocked_count * urgency
        score = round(sev_weight * stage_sum * unblocked_count * urgency, 1)

        recommendations.append({
            "order": idx,
            "action": f"Resolve {issue['category']}: {issue['required_action']}",
            "issue_title": issue["title"],
            "category": issue["category"],
            "severity": issue["severity"],
            "impact_score": score,
            "affected_stages": downstream if downstream else ["TECHNICAL_SCRUTINY"],
            "unblocks": f"Unblocks {len(downstream)} statutory stages ({', '.join(downstream)})" if downstream else "Unblocks Scrutiny Clearance",
            "rule": issue["rule_ref"],
            "evidence": issue.get("evidence", "Scrutiny extraction & institutional filing"),
            "confidence": 0.98,
            "status": "PENDING"
        })

    # Sort recommendations by impact score descending
    recommendations.sort(key=lambda r: r["impact_score"], reverse=True)
    for i, r in enumerate(recommendations, start=1):
        r["order"] = i

    return {
        "case_id": application.get("id"),
        "college_name": application.get("college_name"),
        "total_open_issues": len(open_issues),
        "total_unblocked_pathways": total_unblocked,
        "critical_path_score": round(sum(r["impact_score"] for r in recommendations), 1),
        "recommendations": recommendations,
        "dependency_nodes_active": list(set(i["node_key"] for i in open_issues)),
        "disclaimer": "Impact Radar recommendations are deterministically ranked based on AICTE statutory dependency DAG. AI assists in phrasing; officers make all decisions."
    }
