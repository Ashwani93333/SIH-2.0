from typing import List, Dict, Any
from datetime import datetime, date
import math

def calculate_monthly_snapshots(
    faculty_roster: List[Dict[str, Any]], 
    students: int = 600, 
    fsr_ratio: int = 20, 
    start_month: str = "2025-11", 
    num_months: int = 12,
    event_dates: Dict[str, str] = None
) -> Dict[str, Any]:
    """
    Continuous Faculty Drift Monitoring (PRD §7.5 / M8):
    Computes monthly active faculty strength, compares against required FSR,
    and detects post-approval compliance drift, short-tenure clusters, and churn anomalies.
    """
    events = event_dates or {
        "application_date": "2026-01-15",
        "inspection_date": "2026-03-10",
        "approval_date": "2026-04-20"
    }

    required_strength = math.ceil(students / fsr_ratio)

    snapshots = []
    alerts = []

    # Parse months
    start_year, start_m = map(int, start_month.split("-"))

    month_keys = []
    curr_y, curr_m = start_year, start_m
    for _ in range(num_months):
        month_keys.append(f"{curr_y:04d}-{curr_m:02d}")
        curr_m += 1
        if curr_m > 12:
            curr_m = 1
            curr_y += 1

    for m_str in month_keys:
        # Check active faculty at end of month m_str
        m_year, m_mon = map(int, m_str.split("-"))
        # End of month date approx
        if m_mon in [4, 6, 9, 11]:
            last_day = 30
        elif m_mon == 2:
            last_day = 28
        else:
            last_day = 31
        m_end_date = date(m_year, m_mon, last_day)

        active_faculty = []
        churn_in = 0
        churn_out = 0

        for f in faculty_roster:
            j_date = datetime.strptime(f["join_date"], "%Y-%m-%d").date()
            l_date = datetime.strptime(f["leave_date"], "%Y-%m-%d").date() if f.get("leave_date") else None

            if j_date <= m_end_date and (l_date is None or l_date > m_end_date):
                active_faculty.append(f)

            if j_date.year == m_year and j_date.month == m_mon:
                churn_in += 1
            if l_date and l_date.year == m_year and l_date.month == m_mon:
                churn_out += 1

        strength = len(active_faculty)
        shortfall = max(required_strength - strength, 0)
        compliance_pct = round((strength / required_strength) * 100, 1) if required_strength > 0 else 100.0

        snapshots.append({
            "month": m_str,
            "strength": strength,
            "required": required_strength,
            "shortfall": shortfall,
            "compliance_pct": min(compliance_pct, 100.0),
            "churn_in": churn_in,
            "churn_out": churn_out,
            "status": "COMPLIANT" if shortfall == 0 else "DEFICIENT"
        })

        if shortfall > 0:
            alerts.append({
                "type": "BELOW_REQUIREMENT",
                "severity": "HIGH",
                "month": m_str,
                "message": f"Faculty strength fell to {strength} in {m_str} (Required: {required_strength}, Deficit: {shortfall}).",
                "shortfall": shortfall
            })

    # Detect SHORT_TENURE_CLUSTER around inspection (March 2026)
    short_tenure_fac = []
    insp_date = datetime.strptime(events["inspection_date"], "%Y-%m-%d").date()
    for f in faculty_roster:
        if f.get("leave_date"):
            j_date = datetime.strptime(f["join_date"], "%Y-%m-%d").date()
            l_date = datetime.strptime(f["leave_date"], "%Y-%m-%d").date()
            tenure_days = (l_date - j_date).days
            if tenure_days < 90:
                # check if tenure overlapped with inspection window
                if j_date <= insp_date <= l_date:
                    short_tenure_fac.append({
                        "id": f.get("id"),
                        "name": f.get("name"),
                        "cadre": f.get("cadre"),
                        "tenure_days": tenure_days,
                        "period": f"{f['join_date']} to {f['leave_date']}"
                    })

    if len(short_tenure_fac) >= 2:
        alerts.append({
            "type": "SHORT_TENURE_CLUSTER",
            "severity": "HIGH",
            "message": f"Detected cluster of {len(short_tenure_fac)} temporary faculty hired immediately before EVC inspection and resigned shortly thereafter.",
            "faculty": short_tenure_fac,
            "disclaimer": "Signal for audit; institutions frequently experience turnover, but clustered departures post-inspection require scrutiny."
        })

    return {
        "events": events,
        "required_strength": required_strength,
        "students": students,
        "snapshots": snapshots,
        "alerts": alerts
    }
