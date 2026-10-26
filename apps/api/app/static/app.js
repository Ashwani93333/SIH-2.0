// AICTE FlowGuard — Regulatory Architecture Controller & Dynamic Role State Machine
let currentRole = "Scrutiny Officer";
let currentUser = {
  name: "Dr. A. K. Sharma",
  roleDesc: "Scrutiny Officer • Scrutiny Desk",
  institutionId: null,
  region: "Northern (Kanpur)"
};

let currentCaseId = "AICTE/2026/APP-1042"; // Default Hero case (Sunrise Institute)
let currentCaseData = null;
let currentSimulatedDays = 0;
let scenariosList = [];
let activePipelineStatus = "ALL";
let pipelineSearchQuery = "";
let currentModalTab = "overview";
let currentViewTab = "hero";

// --- Lifecycle Initialization ---
document.addEventListener("DOMContentLoaded", async () => {
  setupNavigation();
  await loadScenarios();
  await refreshRoleState(currentRole);
  await loadRecentActivity();
});

// --- Role Setup & Collaborative Nav (§1.1 & §5) ---
const ROLE_CONFIGS = {
  "Institution": {
    name: "Delhi Institute of Engineering",
    desc: "Institution Applicant • Portal Access",
    institutionId: "INST-DELHI-001",
    region: "Northern (Delhi)",
    primaryTab: "inst-dashboard",
    tabs: [
      { id: "inst-dashboard", label: "Dashboard" },
      { id: "applications", label: "Applications" },
      { id: "compliance", label: "Compliance Self-Check" },
      { id: "documents", label: "Documents Vault" }
    ]
  },
  "Scrutiny Officer": {
    name: "Dr. A. K. Sharma",
    desc: "Scrutiny Officer • Technical Scrutiny Desk",
    institutionId: null,
    region: "Northern (Kanpur)",
    primaryTab: "scrutiny",
    tabs: [
      { id: "hero", label: "Overview" },
      { id: "scrutiny", label: "Scrutiny Desk" },
      { id: "applications", label: "Applications" },
      { id: "documents", label: "Documents" },
      { id: "audit", label: "Audit Ledger" }
    ]
  },
  "Regional Officer": {
    name: "Dr. R. K. Singhania",
    desc: "Regional Officer • Northern Bureau (Kanpur)",
    institutionId: null,
    region: "Northern (Kanpur)",
    primaryTab: "regional",
    tabs: [
      { id: "hero", label: "Overview" },
      { id: "regional", label: "Regional Command Desk" },
      { id: "applications", label: "Applications" },
      { id: "scrutiny", label: "Scrutiny Desk" },
      { id: "evc", label: "EVC Tracking" },
      { id: "audit", label: "Audit & Reports" }
    ]
  },
  "Bureau Officer": {
    name: "Shri Vikram Malhotra",
    desc: "Bureau Officer • Central Bureau (Bhopal)",
    institutionId: null,
    region: "Central (Bhopal)",
    primaryTab: "bureau",
    tabs: [
      { id: "hero", label: "Overview" },
      { id: "bureau", label: "Bureau Command Desk" },
      { id: "bottlenecks", label: "Bottlenecks & Impact" },
      { id: "applications", label: "Applications" },
      { id: "scrutiny", label: "Scrutiny Desk" },
      { id: "evc", label: "EVC Tracking" },
      { id: "audit", label: "Audit & Reports" }
    ]
  },
  "EVC Coordinator": {
    name: "Prof. Ramesh Rao",
    desc: "EVC Coordinator • National Expert Roster",
    institutionId: null,
    region: "National Bureau",
    primaryTab: "evc",
    tabs: [
      { id: "hero", label: "Overview" },
      { id: "evc", label: "EVC Tracking & Panels" },
      { id: "applications", label: "Applications" },
      { id: "audit", label: "Reports & Audit" }
    ]
  },
  "EVC Member": {
    name: "Dr. Sunita Verma",
    desc: "EVC Member • Expert Visit Committee",
    institutionId: null,
    region: "National Bureau",
    primaryTab: "evc",
    tabs: [
      { id: "hero", label: "Overview" },
      { id: "evc", label: "Assigned Inspections" },
      { id: "applications", label: "Applications" },
      { id: "documents", label: "Checklists & Evidence" }
    ]
  },
  "Committee Member": {
    name: "Prof. H. R. Venkatesh",
    desc: "Committee Member • Standing Hearing Committee",
    institutionId: null,
    region: "Apex Council",
    primaryTab: "committee",
    tabs: [
      { id: "hero", label: "Overview" },
      { id: "committee", label: "Committee Hearings" },
      { id: "applications", label: "Applications" },
      { id: "audit", label: "Reports & Audit" }
    ]
  },
  "Competent Authority": {
    name: "Prof. Rajive Kumar",
    desc: "Member Secretary • Competent Authority",
    institutionId: null,
    region: "Apex Council",
    primaryTab: "authority",
    tabs: [
      { id: "hero", label: "Overview" },
      { id: "authority", label: "Statutory Sign-Off" },
      { id: "applications", label: "Applications" },
      { id: "audit", label: "Audit Ledger" }
    ]
  },
  "Administrator": {
    name: "System Administrator",
    desc: "AICTE Portal Administrator",
    institutionId: null,
    region: "Headquarters",
    primaryTab: "applications",
    tabs: [
      { id: "hero", label: "Overview" },
      { id: "applications", label: "Applications" },
      { id: "regional", label: "Regional Desk" },
      { id: "bureau", label: "Bureau Desk" },
      { id: "evc", label: "EVC Tracking" },
      { id: "audit", label: "Audit Ledger" }
    ]
  }
};

async function handleRoleChange(selectedRole) {
  currentRole = selectedRole;
  await refreshRoleState(selectedRole);
  showToast("Role Switched", `Active scope changed to ${currentUser.name} (${selectedRole}).`, "info");
}

async function refreshRoleState(role) {
  const cfg = ROLE_CONFIGS[role] || ROLE_CONFIGS["Scrutiny Officer"];
  currentUser = {
    name: cfg.name,
    roleDesc: cfg.desc,
    institutionId: cfg.institutionId,
    region: cfg.region
  };

  document.getElementById("userName").textContent = currentUser.name;
  document.getElementById("userRoleDesc").textContent = currentUser.roleDesc;
  document.getElementById("userAvatar").textContent = currentUser.name.charAt(0);

  // Re-render Dynamic Navigation Tabs
  renderNavigationTabs(cfg.tabs);

  // Switch to primary tab for that role
  switchTab(cfg.primaryTab);

  // Refresh active view data
  await refreshActiveData();
}

function renderNavigationTabs(tabs) {
  const navContainer = document.getElementById("dynamicNavLinks");
  if (!navContainer) return;
  navContainer.innerHTML = "";

  tabs.forEach((t) => {
    const btn = document.createElement("button");
    btn.className = `nav-btn ${t.id === currentViewTab ? "active" : ""}`;
    btn.id = `nav-${t.id}`;
    btn.textContent = t.label;
    btn.onclick = () => switchTab(t.id);
    navContainer.appendChild(btn);
  });
}

function setupNavigation() {
  // Base navigation listener
}

function switchTab(tabId) {
  currentViewTab = tabId;

  // Toggle view sections
  document.querySelectorAll(".view-section").forEach((sec) => sec.classList.remove("active"));
  const targetView = document.getElementById(`view-${tabId}`);
  if (targetView) targetView.classList.add("active");

  // Toggle nav buttons
  document.querySelectorAll(".nav-btn").forEach((btn) => btn.classList.remove("active"));
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) activeNav.classList.add("active");

  refreshActiveData();
}

function openCurrentRolePrimaryTab() {
  const cfg = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS["Scrutiny Officer"];
  switchTab(cfg.primaryTab);
}

async function refreshActiveData() {
  if (currentViewTab === "inst-dashboard") {
    await loadInstitutionSummary();
  } else if (currentViewTab === "applications") {
    await loadApplications();
  } else if (currentViewTab === "scrutiny") {
    await loadScrutinyDesk();
  } else if (currentViewTab === "regional") {
    await loadRegionalDesk();
  } else if (currentViewTab === "bureau") {
    await loadBureauDesk();
  } else if (currentViewTab === "bottlenecks") {
    await loadBottleneckAnalytics();
  } else if (currentViewTab === "evc") {
    await loadEvcTracking();
  } else if (currentViewTab === "committee") {
    await loadCommitteeDesk();
  } else if (currentViewTab === "authority") {
    await loadAuthorityDesk();
  } else if (currentViewTab === "compliance") {
    await loadComplianceTrend();
  } else if (currentViewTab === "documents") {
    await loadDocumentsVault();
  } else if (currentViewTab === "audit") {
    await loadAuditLedger();
  }
}

// --- Scenarios Loader & Quick Pills (§1.3 & §9) ---
async function loadScenarios() {
  try {
    const res = await fetch("/scenarios");
    scenariosList = await res.json();
    renderScenarioPills();
  } catch (err) {
    console.error("Failed to load scenarios:", err);
  }
}

function renderScenarioPills() {
  const container = document.getElementById("scenarioPills");
  if (!container) return;
  container.innerHTML = "";

  scenariosList.forEach((s) => {
    const pill = document.createElement("button");
    const isCurrent = s.id === currentCaseId || s.key === currentCaseId;
    const bandClass = s.expected_band ? `pill-${s.expected_band.toLowerCase()}` : "pill-amber";
    pill.className = `scenario-pill ${bandClass} ${isCurrent ? "active" : ""}`;
    pill.textContent = `${s.key}: ${s.college_name.split(" ")[0]}`;
    pill.title = `${s.scenario_name} • ${s.expected_summary}`;
    pill.onclick = () => selectCase(s.id);
    container.appendChild(pill);
  });
}

async function selectCase(caseId) {
  currentCaseId = caseId;
  renderScenarioPills();
  await viewCaseDetails(caseId);
}

// --- Institution Applicant Summary (§1.2 #1) ---
async function loadInstitutionSummary() {
  try {
    const instId = currentUser.institutionId || "INST-DELHI-001";
    const res = await fetch(`/institutions/me/summary?institution_id=${encodeURIComponent(instId)}`);
    const data = await res.json();

    document.getElementById("instMyAppsCount").textContent = data.my_applications_count;
    document.getElementById("instOpenDefsCount").textContent = data.open_deficiencies_count;
    document.getElementById("instMandatesCount").textContent = data.compliance_mandates_due;
    document.getElementById("instNextActionDesc").textContent = data.next_required_action;

    const tbody = document.getElementById("instAppsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (data.applications.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-24 text-muted">
            <div style="font-size: 1.1rem; margin-bottom: 6px;">🏛️ No Active Statutory Applications Filed</div>
            <p>Click <strong>"+ New Approval Application"</strong> to begin self-registration for Academic Year 2026-2027.</p>
          </td>
        </tr>
      `;
    } else {
      data.applications.forEach((app) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${app.id}</strong></td>
          <td>${app.type}</td>
          <td>${app.academic_year}</td>
          <td>${app.submitted_at}</td>
          <td><span class="badge-subtle">${app.stage_detail}</span></td>
          <td><span class="state-pill state-${app.status.toLowerCase()}">${app.status}</span></td>
          <td>
            <button class="btn-sm btn-primary" onclick="viewCaseDetails('${app.id}')">View Details</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error("Failed to load institution summary:", err);
  }
}

// --- Applications Pipeline Tracker (§1.2 #2) ---
async function loadApplications() {
  try {
    let url = `/applications?status=${activePipelineStatus}&q=${encodeURIComponent(pipelineSearchQuery)}`;
    if (currentUser.institutionId) {
      url += `&institution_id=${encodeURIComponent(currentUser.institutionId)}&role=Institution`;
    } else if (currentRole === "Regional Officer") {
      url += `&region=Northern&role=Regional+Officer`;
    } else if (currentRole === "Bureau Officer") {
      url += `&region=Central&role=Bureau+Officer`;
    }

    const res = await fetch(url);
    const data = await res.json();

    // Update Overview Cards (§1.2 #2)
    document.getElementById("pipeTotalCount").textContent = data.pipeline.total;
    document.getElementById("pipePendingCount").textContent = data.pipeline.pending;
    document.getElementById("pipeApprovedCount").textContent = data.pipeline.approved;
    document.getElementById("pipeRejectedCount").textContent = data.pipeline.rejected;
    document.getElementById("pipeApprovalRateText").textContent = `Approval Rate: ${data.pipeline.approval_rate_pct}%`;

    // Update Multi-Stage Bar (§1.2 #2)
    const st = data.pipeline.stages;
    const pct = data.pipeline.stage_percentages;
    document.getElementById("pipelineProgressSummary").textContent =
      `SUBMITTED (${st.SUBMITTED}) • UNDER REVIEW (${st.UNDER_REVIEW}) • COMMITTEE (${st.COMMITTEE}) • APPROVED (${st.APPROVED}) • REJECTED (${st.REJECTED})`;

    const multiBar = document.getElementById("pipelineMultiBar");
    if (multiBar) {
      multiBar.innerHTML = `
        <div class="p-segment seg-submitted" style="width: ${pct.SUBMITTED}%;" title="Submitted: ${pct.SUBMITTED}%"></div>
        <div class="p-segment seg-review" style="width: ${pct.UNDER_REVIEW}%;" title="Under Review: ${pct.UNDER_REVIEW}%"></div>
        <div class="p-segment seg-committee" style="width: ${pct.COMMITTEE}%;" title="Committee: ${pct.COMMITTEE}%"></div>
        <div class="p-segment seg-approved" style="width: ${pct.APPROVED}%;" title="Approved: ${pct.APPROVED}%"></div>
        <div class="p-segment seg-rejected" style="width: ${pct.REJECTED}%;" title="Rejected: ${pct.REJECTED}%"></div>
      `;
    }

    // Dynamic Pagination Text (§10 #2)
    document.getElementById("tablePaginationText").textContent = data.pagination.showing_text;

    // Render Table
    const tbody = document.getElementById("allAppsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (data.items.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-16 text-muted">No applications found matching current scope or filter criteria.</td></tr>`;
      return;
    }

    data.items.forEach((app) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${app.id}</strong></td>
        <td>
          <div style="font-weight: 600;">${app.college_name}</div>
          <small class="text-muted">${app.city || app.region}</small>
        </td>
        <td>${app.type}</td>
        <td>${app.region}</td>
        <td>${app.submitted_at}</td>
        <td><span class="state-pill state-${app.status.toLowerCase()}">${app.status}</span></td>
        <td><span class="badge-subtle">${app.stage_detail}</span></td>
        <td>
          <button class="btn-sm btn-primary" onclick="viewCaseDetails('${app.id}')">View Details</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load applications:", err);
  }
}

function filterPipelineStatus(status) {
  activePipelineStatus = status;
  document.querySelectorAll("#statusFilterChips .chip").forEach((c) => {
    c.classList.toggle("active", c.textContent.trim() === status);
  });
  loadApplications();
}

function handlePipelineSearch(query) {
  pipelineSearchQuery = query;
  loadApplications();
}

function exportApplicationsCsv() {
  window.open("/applications?format=csv", "_blank");
}

// --- Scrutiny Desk (§1.2 #4) ---
async function loadScrutinyDesk() {
  try {
    const res = await fetch("/scrutiny/summary");
    const data = await res.json();

    document.getElementById("scrutinyQueueCount").textContent = data.queued_for_scrutiny;
    document.getElementById("scrutinyActiveDefs").textContent = data.active_deficiencies;
    document.getElementById("scrutinyRectifiedDefs").textContent = data.rectified_deficiencies;
    document.getElementById("scrutinyTurnaroundText").textContent = `Average turnaround: ${data.average_turnaround_days} days`;

    // Casework queue
    const qBody = document.getElementById("scrutinyQueueTableBody");
    if (qBody) {
      qBody.innerHTML = "";
      data.casework_queue.forEach((app) => {
        const defCount = app.deficiencies ? app.deficiencies.length : 0;
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${app.id}</strong></td>
          <td>${app.college_name}</td>
          <td>${app.assigned_officer_name || "Dr. A. K. Sharma"}</td>
          <td>${app.second_reviewer_name || "Dr. R. K. Singhania"}</td>
          <td><span class="${defCount > 0 ? 'text-danger font-bold' : ''}">${defCount} Deficit(s)</span></td>
          <td><span class="state-pill state-${app.status.toLowerCase()}">${app.status}</span></td>
          <td><span class="risk-pill pill-${(app.expected_band || 'amber').toLowerCase()}">RISK: ${app.expected_band || 'AMBER'}</span></td>
          <td>
            <button class="btn-sm btn-brown" onclick="viewCaseDetails('${app.id}')">Conduct Scrutiny</button>
          </td>
        `;
        qBody.appendChild(tr);
      });
    }

    // Active deficiencies list
    const defBody = document.getElementById("activeDeficienciesTableBody");
    if (defBody) {
      defBody.innerHTML = "";
      data.all_active_deficiencies.forEach((d) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td><strong>${d.id}</strong></td>
          <td>${d.college_name}</td>
          <td><span class="badge-danger">${d.category}</span></td>
          <td>${d.description}</td>
          <td><strong class="text-danger">${d.deadline}</strong></td>
          <td><small>${d.required_action}</small></td>
          <td><span class="state-pill ${d.status === 'RESUBMITTED' ? 'state-committee' : 'state-review'}">${d.status}</span></td>
          <td>
            <button class="btn-sm btn-primary" onclick="clearDeficiencyPrompt('${d.id}')">Verify & Clear</button>
          </td>
        `;
        defBody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error("Failed to load scrutiny summary:", err);
  }
}

// --- Regional Command Desk (§1.2 #5) ---
async function loadRegionalDesk() {
  try {
    const res = await fetch("/regions/Northern/summary");
    const data = await res.json();

    document.getElementById("regQueueCount").textContent = data.regional_queue;
    document.getElementById("regUnassignedCount").textContent = data.unassigned_work;
    document.getElementById("regActiveProgress").textContent = data.active_in_progress;
    document.getElementById("regEscalationsCount").textContent = data.deadlines_and_escalations;

    const tbody = document.getElementById("regionalCaseloadTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    data.caseload_registry.forEach((app) => {
      const isUnassigned = !app.assigned_officer_name || app.status === "SUBMITTED";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${app.id}</strong></td>
        <td>${app.college_name}</td>
        <td>${app.type}</td>
        <td><span class="badge-subtle">${app.stage_detail}</span></td>
        <td>${app.assigned_officer_name || '<span class="text-danger">Unassigned</span>'}</td>
        <td><span class="state-pill state-${app.status.toLowerCase()}">${app.status}</span></td>
        <td>${isUnassigned ? '<span class="badge-danger">SLA: >48h Alert</span>' : '<span class="badge-success">On Track</span>'}</td>
        <td>
          ${isUnassigned
            ? `<button class="btn-sm btn-brown" onclick="promptAssignOfficer('${app.id}')">Assign Officer</button>`
            : `<button class="btn-sm btn-primary" onclick="viewCaseDetails('${app.id}')">Review Case</button>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load regional desk:", err);
  }
}

// --- Bureau Command Desk (§1.2 #5 & §10 #5) ---
async function loadBureauDesk() {
  try {
    const res = await fetch("/regions/Central/summary");
    const data = await res.json();

    document.getElementById("bureauQueueCount").textContent = data.regional_queue;
    document.getElementById("bureauBottlenecksCount").textContent = 3;

    const tbody = document.getElementById("bureauCaseloadTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    data.caseload_registry.forEach((app) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${app.id}</strong></td>
        <td>${app.college_name}</td>
        <td>${app.type}</td>
        <td>${app.assigned_officer_name || "Dr. Ananya Sharma"}</td>
        <td><span class="state-pill state-${app.status.toLowerCase()}">${app.status}</span></td>
        <td>${app.deficiencies ? app.deficiencies.length : 0} Deficit(s)</td>
        <td>
          <button class="btn-sm btn-primary" onclick="viewCaseDetails('${app.id}')">Inspect File</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load bureau desk:", err);
  }
}

// --- Bottlenecks Analytics (§6.4 & §10) ---
async function loadBottleneckAnalytics() {
  try {
    const res = await fetch("/analytics/bottlenecks");
    const data = await res.json();

    const container = document.getElementById("bottlenecksContainer");
    if (!container) return;
    container.innerHTML = "";

    data.bottlenecks.forEach((b) => {
      const card = document.createElement("div");
      card.className = "bottleneck-card";
      card.innerHTML = `
        <div class="bottleneck-card-header">
          <span class="bottleneck-cat">${b.category}</span>
          <span class="bottleneck-count-badge">${b.count} Files Blocked</span>
        </div>
        <p class="section-desc">Identified across multiple institutional filings awaiting resolution.</p>
        <ul style="margin: 10px 0 0 16px; font-size: 0.8rem; color: var(--text-secondary);">
          ${b.sample_issues.map((s) => `<li>${s}</li>`).join("")}
        </ul>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load bottlenecks:", err);
  }
}

// --- EVC Tracking (§1.2 #6) ---
async function loadEvcTracking() {
  try {
    const res = await fetch("/evc/inspections");
    const data = await res.json();

    document.getElementById("evcScheduledCount").textContent = data.scheduled_next_14_days;
    document.getElementById("evcPoolCount").textContent = data.panel_pool_available;
    document.getElementById("evcHearingsCount").textContent = data.pending_hearings;

    const tbody = document.getElementById("evcInspectionsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    data.inspections.forEach((item) => {
      const insp = item.inspection;
      const panelStr = insp.panel_members && insp.panel_members.length > 0
        ? insp.panel_members.join(", ")
        : '<span class="text-amber">Empanelment in progress</span>';

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${item.application_id}</strong></td>
        <td>${item.college_name}</td>
        <td>${insp.scheduled_date || "2026-06-29"}</td>
        <td>${panelStr}</td>
        <td><span class="badge-subtle">${insp.mode || "PHYSICAL"}</span></td>
        <td><span class="state-pill state-${insp.status === 'COMPLETED' ? 'approved' : 'committee'}">${insp.status}</span></td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn-sm btn-primary" onclick="viewCaseDetails('${item.application_id}')">Manage EVC</button>
            ${insp.status !== 'COMPLETED' ? `<button class="btn-sm btn-brown" onclick="openSubmitEvcReportModal('${item.application_id}')">Submit Report</button>` : ''}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load EVC tracking:", err);
  }
}

// --- Committee Hearings Desk (§2 Step 3) ---
async function loadCommitteeDesk() {
  try {
    const res = await fetch("/applications?role=Committee+Member");
    const data = await res.json();

    const tbody = document.getElementById("committeeHearingsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const committeeCases = data.items.filter((a) => a.status === "COMMITTEE" || a.stage_detail === "COMMITTEE_HEARING" || a.id.includes("1038") || a.id.includes("1005"));

    committeeCases.forEach((app) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${app.id}</strong></td>
        <td>${app.college_name}</td>
        <td>${app.type}</td>
        <td><span class="badge-info">Standing Hearing Committee Batch B</span></td>
        <td><small>EVC report recommended approval; CAD laboratory compliance verified.</small></td>
        <td><span class="state-pill state-committee">Hearing Active</span></td>
        <td>
          <button class="btn-sm btn-brown" onclick="submitCommitteeRecommendationPrompt('${app.id}')">Submit Recommendation</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load committee desk:", err);
  }
}

// --- Authority Sign-Off Desk (§2 Step 4) ---
async function loadAuthorityDesk() {
  try {
    const res = await fetch("/applications?role=Competent+Authority");
    const data = await res.json();

    const tbody = document.getElementById("authoritySignOffTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const cases = data.items.filter((a) => a.status === "COMMITTEE" || a.status === "UNDER_REVIEW" || a.status === "APPROVED");

    cases.forEach((app) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${app.id}</strong></td>
        <td>${app.college_name}</td>
        <td>${app.type}</td>
        <td>${app.status === 'APPROVED' ? 'Approved by Member Secretary' : 'Recommended for Grant of LOA'}</td>
        <td><span class="risk-pill pill-${(app.expected_band || 'green').toLowerCase()}">RISK: ${app.expected_band || 'GREEN'}</span></td>
        <td>${app.status === 'APPROVED' ? '0' : 'None Outstanding'}</td>
        <td>
          <button class="btn-sm btn-brown" onclick="openDecisionModal('${app.id}')">Statutory Sign-Off</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load authority desk:", err);
  }
}

// --- Application Detail Modal Controller (§1.2 #3 & §6.4) ---
async function viewCaseDetails(caseId) {
  try {
    currentCaseId = caseId;
    const res = await fetch(`/applications/${encodeURIComponent(caseId)}`);
    if (!res.ok) {
      showToast("Error", "Could not load application record.", "error");
      return;
    }
    currentCaseData = await res.json();
    const meta = currentCaseData.metadata;

    // Header info
    document.getElementById("modalCaseId").textContent = meta.id;
    document.getElementById("modalCollegeName").textContent = meta.college_name;
    document.getElementById("modalTypePill").textContent = meta.type;
    document.getElementById("modalStatePill").textContent = meta.status;
    document.getElementById("modalStatePill").className = `state-pill state-${meta.status.toLowerCase()}`;

    const risk = currentCaseData.risk;
    document.getElementById("modalRiskPill").textContent = `RISK: ${risk.risk_band} (${risk.risk_score}/100)`;
    document.getElementById("modalRiskPill").className = `risk-pill pill-${risk.risk_band.toLowerCase()}`;

    document.getElementById("modalMetaRow").innerHTML = `
      <span><strong>Region:</strong> ${meta.region}</span>
      <span><strong>Academic Year:</strong> ${meta.academic_year}</span>
      <span><strong>Submitted:</strong> ${meta.submitted_at}</span>
    `;

    // 4-Stage Progress Tracker (§2)
    updateWorkflowProgressBar(meta.status, meta.stage_detail);

    // Reviewer & SLA
    document.getElementById("modalReviewerName").textContent = meta.assigned_officer_name || "Dr. A. K. Sharma";
    document.getElementById("modalSecondReviewer").textContent = `Second: ${meta.second_reviewer_name || "Rajeshwari Nair"} (${meta.dual_scrutiny_status})`;
    document.getElementById("modalSlaStatus").textContent = currentCaseData.sla.status;
    document.getElementById("modalSlaDays").textContent = `${currentCaseData.sla.days_remaining} working days remaining (${currentCaseData.sla.clock_owner})`;

    // Outstanding Deficiencies Count
    const openDefs = (currentCaseData.deficiencies || []).filter((d) => d.status === "OPEN" || d.status === "RESUBMITTED").length;
    document.getElementById("modalDefsCount").textContent = `${openDefs} Active Deficit(s)`;
    document.getElementById("modalTabDeficiencies").textContent = `Deficiencies (${currentCaseData.deficiencies ? currentCaseData.deficiencies.length : 0})`;

    // Render Stage Buttons & Callout
    renderStageActionButtons(meta.status, meta.stage_detail, openDefs);

    // Render Tab 1 (Overview & Scrutiny)
    renderModalRules(currentCaseData.verification.rule_results);
    renderModalDocCross(currentCaseData.verification);

    // Render Tab 2 (Deficiencies)
    renderModalDeficiencies(currentCaseData.deficiencies || []);

    // Render Tab 3 (EVC Committee)
    renderModalEvcContent(currentCaseData);

    // Render Tab 4 (Impact Radar)
    renderModalImpactRadar(currentCaseData.impact_radar);

    // Render Tab 5 (Audit Timeline)
    await renderModalCaseAudit(meta.id);

    // Render Tab 6 (Statutory Decision)
    renderModalDecisionContent(currentCaseData);

    // Open Modal
    switchModalTab("overview");
    document.getElementById("appDetailModal").classList.add("active");
  } catch (err) {
    console.error("Failed to render case details:", err);
  }
}

function updateWorkflowProgressBar(status, stageDetail) {
  const steps = ["step-intake", "step-scrutiny", "step-committee", "step-decision"];
  const conns = ["conn-1", "conn-2", "conn-3"];

  let activeIdx = 1;
  if (status === "SUBMITTED") activeIdx = 0;
  else if (status === "UNDER_REVIEW") activeIdx = 1;
  else if (status === "COMMITTEE") activeIdx = 2;
  else if (status === "APPROVED" || status === "REJECTED") activeIdx = 3;

  steps.forEach((s, idx) => {
    document.getElementById(s).classList.toggle("active", idx <= activeIdx);
  });
  conns.forEach((c, idx) => {
    document.getElementById(c).classList.toggle("active", idx < activeIdx);
  });
}

function renderStageActionButtons(status, stageDetail, openDefs) {
  const container = document.getElementById("modalStageActionBtns");
  const textEl = document.getElementById("modalNextActionText");
  container.innerHTML = "";

  if (status === "SUBMITTED") {
    textEl.textContent = "Unassigned file in Regional Intake Queue. Scrutiny Officer must be allocated within 48h.";
    container.innerHTML = `<button class="btn-sm btn-brown" onclick="promptAssignOfficer('${currentCaseId}')">Assign Scrutiny Officer</button>`;
  } else if (status === "UNDER_REVIEW") {
    if (openDefs > 0) {
      textEl.textContent = `${openDefs} active deficiency notice outstanding. Institution has 14 business days from notice to respond.`;
      container.innerHTML = `
        <button class="btn-sm btn-primary" onclick="openRaiseDeficiencyModal()">+ Raise Deficiency</button>
        <button class="btn-sm btn-secondary" onclick="switchModalTab('radar')">Inspect Impact Radar</button>
      `;
    } else {
      textEl.textContent = "All scrutiny rules compliant. Dual-scrutiny confirmation verified. Ready to order EVC inspection or fast-track hearing.";
      container.innerHTML = `
        <button class="btn-sm btn-brown" onclick="orderEvcVisit('${currentCaseId}')">Order EVC Visit</button>
        <button class="btn-sm btn-secondary" onclick="fastTrackHearing('${currentCaseId}')">⚡ Fast-Track Hearing</button>
      `;
    }
  } else if (status === "COMMITTEE") {
    textEl.textContent = "Application under Standing Hearing Committee review. Awaiting observation report and recommendation.";
    container.innerHTML = `
      <button class="btn-sm btn-brown" onclick="openScheduleEvcModal('${currentCaseId}')">Schedule EVC</button>
      <button class="btn-sm btn-primary" onclick="submitCommitteeRecommendationPrompt('${currentCaseId}')">Submit Recommendation</button>
    `;
  } else if (status === "APPROVED") {
    textEl.textContent = "Statutory Letter of Approval (LOA/EOA) issued by Member Secretary. Continuous drift surveillance active.";
    container.innerHTML = `<button class="btn-sm btn-ghost" onclick="switchModalTab('decision')">View Approval Order</button>`;
  } else if (status === "REJECTED") {
    textEl.textContent = "Letter of Rejection (LOR) issued due to unaddressed statutory norms.";
    container.innerHTML = `<button class="btn-sm btn-ghost" onclick="switchModalTab('decision')">View Rejection Order</button>`;
  }
}

function renderModalRules(rules) {
  const container = document.getElementById("modalRuleResults");
  if (!container) return;
  container.innerHTML = "";

  rules.forEach((r) => {
    const isPass = r.status === "PASS";
    const div = document.createElement("div");
    div.className = `rule-item ${isPass ? 'rule-pass' : 'rule-fail'}`;
    div.innerHTML = `
      <div class="rule-header">
        <span class="rule-id">${r.rule_id}: ${r.name}</span>
        <span class="rule-status ${isPass ? 'status-pass' : 'status-fail'}">${isPass ? 'COMPLIANT' : 'DEFICIENT'}</span>
      </div>
      <div class="rule-desc">${r.explanation}</div>
      <div class="rule-clause">Clause Reference: ${r.source_clause}</div>
    `;
    container.appendChild(div);
  });
}

function renderModalDocCross(verif) {
  const container = document.getElementById("modalDocCrossResults");
  if (!container) return;
  container.innerHTML = "";

  const doc = verif.document_ai;
  const isMatch = doc.status === "MATCH";

  const docDiv = document.createElement("div");
  docDiv.className = `doc-box ${isMatch ? 'doc-match' : 'doc-mismatch'}`;
  docDiv.innerHTML = `
    <div class="doc-header">
      <strong>Fire Safety NOC Verification:</strong>
      <span class="badge-${isMatch ? 'success' : 'danger'}">${doc.status}</span>
    </div>
    <div style="font-size: 0.8rem; margin-top: 4px;">Declared Expiry: <strong>${doc.declared_value}</strong> &bull; Extracted: <strong>${doc.extracted_value || 'Unreadable'}</strong></div>
    <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">Model Confidence: ${Math.round(doc.confidence * 100)}% &bull; Authority: ${doc.issuing_authority}</div>
  `;
  container.appendChild(docDiv);

  // Cross-record duplicates
  const dups = verif.cross_record_flags || [];
  const dupDiv = document.createElement("div");
  dupDiv.className = "cross-box mt-12";
  if (dups.length === 0) {
    dupDiv.innerHTML = `<div class="badge-success">✓ Nationwide Duplicate PAN Check: Clean (No Concurrency Detected)</div>`;
  } else {
    dupDiv.innerHTML = `
      <div class="badge-danger">⚠️ Concurrent Faculty Conflict Flagged:</div>
      <div style="font-size: 0.8rem; margin-top: 4px;">${dups[0].explanation}</div>
      <small style="color: var(--text-muted);">Signal for officer investigation; human verification required.</small>
    `;
  }
  container.appendChild(dupDiv);
}

function renderModalDeficiencies(defs) {
  const tbody = document.getElementById("modalDeficienciesTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (defs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-16 text-success">✓ No open statutory deficiencies recorded for this application.</td></tr>`;
    return;
  }

  defs.forEach((d) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${d.id}</strong></td>
      <td><span class="badge-danger">${d.category}</span></td>
      <td>${d.description}</td>
      <td><small>${d.handbook_clause || 'AICTE APH 2024-27'}</small></td>
      <td>${d.required_action}</td>
      <td><strong class="text-danger">${d.deadline}</strong></td>
      <td><span class="state-pill ${d.status === 'CLEARED' ? 'state-approved' : (d.status === 'RESUBMITTED' ? 'state-committee' : 'state-review')}">${d.status}</span></td>
      <td>
        ${d.status === 'OPEN'
          ? `<button class="btn-sm btn-secondary" onclick="promptResubmitDeficiency('${d.id}')">Resubmit Evidence</button>`
          : (d.status === 'RESUBMITTED'
              ? `<button class="btn-sm btn-primary" onclick="clearDeficiencyPrompt('${d.id}')">Verify & Clear</button>`
              : '<span class="text-success">Cleared</span>'
            )
        }
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderModalEvcContent(caseData) {
  const container = document.getElementById("modalEvcContent");
  if (!container) return;

  const insp = caseData.evc_inspection;
  if (!insp) {
    container.innerHTML = `
      <div class="text-center py-20 text-muted">
        <p>No Expert Visit Committee inspection has been scheduled yet.</p>
        <button class="btn-sm btn-brown mt-8" onclick="openScheduleEvcModal()">Schedule EVC Inspection</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="evc-card-detail">
      <div class="flex-between">
        <div>
          <h4>EVC Inspection Details (${insp.mode || 'PHYSICAL'})</h4>
          <p class="section-desc">Scheduled Date: <strong>${insp.scheduled_date}</strong> &bull; Status: <span class="badge-info">${insp.status}</span></p>
        </div>
        ${insp.status !== 'COMPLETED' ? `<button class="btn-sm btn-brown" onclick="openSubmitEvcReportModal('${currentCaseId}')">Submit Observation Report</button>` : ''}
      </div>
      <div class="mt-12">
        <strong>Assigned Senior Academicians:</strong>
        <p>${(insp.panel_members && insp.panel_members.length > 0) ? insp.panel_members.join(", ") : 'Panel empanelment in progress'}</p>
      </div>
      ${insp.report_notes ? `
        <div class="mt-12 p-12 bg-subtle rounded">
          <strong>Observation Report Findings:</strong>
          <p>${insp.report_notes}</p>
        </div>
      ` : ''}
    </div>
  `;
}

// --- Impact Radar Rendering (§6.4) ---
function renderModalImpactRadar(radar) {
  document.getElementById("radarCriticalScore").textContent = radar.critical_path_score || "68.4";
  const tbody = document.getElementById("modalRadarTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const recs = radar.recommendations || [];
  if (recs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center py-16 text-success">✓ Clean Critical Path: No blocking regulatory bottlenecks detected.</td></tr>`;
    return;
  }

  recs.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>#${r.order}</strong></td>
      <td><strong>${r.action}</strong><br><small class="text-muted">${r.unblocks}</small></td>
      <td><span class="badge-info">${r.category}</span></td>
      <td><span class="badge-danger">${r.severity}</span></td>
      <td><strong class="text-amber" style="font-size: 1.1rem;">${r.impact_score}</strong></td>
      <td>${(r.affected_stages || []).map((s) => `<span class="badge-subtle">${s}</span>`).join(" ")}</td>
      <td><small>${r.rule}</small></td>
      <td>
        <button class="btn-sm btn-primary" onclick="showToast('Action Accepted', 'Recommended resolution logged to case history.', 'success')">Accept</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- Case Audit Timeline (§6.5) ---
async function renderModalCaseAudit(caseId) {
  try {
    const res = await fetch(`/applications/${encodeURIComponent(caseId)}/audit`);
    const entries = await res.json();
    const tbody = document.getElementById("modalCaseAuditTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (entries.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-12 text-muted">No specific audit entries logged for this case ID yet.</td></tr>`;
      return;
    }

    entries.forEach((e) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><small>${new Date(e.ts).toLocaleTimeString()} (${new Date(e.ts).toLocaleDateString()})</small></td>
        <td><strong>${e.actor}</strong></td>
        <td>${e.role}</td>
        <td><span class="badge-subtle">${e.action}</span></td>
        <td><small>${JSON.stringify(e.details)}</small></td>
        <td><code>${e.hash ? e.hash.substring(0, 14) + '...' : 'GENESIS'}</code></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load case audit:", err);
  }
}

// --- Statutory Decision Order View (§2 Step 4) ---
function renderModalDecisionContent(caseData) {
  const container = document.getElementById("modalDecisionContent");
  if (!container) return;

  const decision = caseData.final_decision;
  if (!decision) {
    container.innerHTML = `
      <div class="text-center py-24 text-muted">
        <div style="font-size: 1.2rem; margin-bottom: 8px;">⚖️ Statutory Decision Pending</div>
        <p>Awaiting completion of Technical Scrutiny and Hearing Committee recommendation.</p>
        ${(currentRole === 'Competent Authority' || currentRole === 'Authority')
          ? `<button class="btn-sm btn-brown mt-12" onclick="openDecisionModal('${currentCaseId}')">Affix Digital Seal & Issue Order</button>`
          : ''}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="decision-order-card" style="border: 2px solid #8B5E3C; padding: 20px; border-radius: 8px; background: #FCFAF7;">
      <div class="flex-between">
        <div>
          <h3 style="color: #8B5E3C;">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</h3>
          <p><strong>STATUTORY REGULATORY ORDER &bull; ACADEMIC YEAR 2026-2027</strong></p>
        </div>
        <div style="text-align: right;">
          <span class="state-pill state-approved">${decision.type}</span>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px;">Digital Hash: ${decision.signed_at || 'VERIFIED'}</div>
        </div>
      </div>
      <div class="mt-16" style="border-top: 1px solid #E8E2D8; padding-top: 12px;">
        <p><strong>Institution:</strong> ${caseData.metadata.college_name}</p>
        <p><strong>Authorized Signatory:</strong> ${decision.authority}</p>
        <p><strong>Official Observations:</strong> ${decision.note}</p>
      </div>
      <div class="mt-16 flex-between">
        <div style="font-size: 0.75rem; color: #666;">
          🔒 Cryptographically sealed with AICTE Digital Root Certificate.<br>
          <em>Prototype, not an official AICTE document.</em>
        </div>
        <div style="background: #FFF; padding: 8px; border: 1px solid #CCC; text-align: center; border-radius: 4px;">
          <span style="font-size: 1.5rem;">📱</span><br>
          <small>QR Seal Verified</small>
        </div>
      </div>
    </div>
  `;
}

function switchModalTab(tabKey) {
  currentModalTab = tabKey;
  document.querySelectorAll(".modal-tabs-bar .m-tab").forEach((btn, idx) => {
    btn.classList.toggle("active", btn.textContent.toLowerCase().includes(tabKey));
  });
  document.querySelectorAll(".modal-tab-content").forEach((c) => c.classList.remove("active"));
  const target = document.getElementById(`m-tab-${tabKey}`);
  if (target) target.classList.add("active");
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

// --- Action Transitions & Deficiencies ---
async function orderEvcVisit(caseId) {
  try {
    const res = await fetch(`/applications/${encodeURIComponent(caseId)}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_state: "COMMITTEE",
        role: currentRole,
        actor: currentUser.name,
        action: "ORDER_EVC",
        reason: "Dual scrutiny completed with zero unrectified deficits. Ordered physical EVC inspection."
      })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast("Transition Error", data.detail || "Cannot order EVC visit.", "error");
      return;
    }
    showToast("EVC Visit Ordered", "Case successfully advanced to EVC / Committee stage.", "success");
    await viewCaseDetails(caseId);
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to order EVC:", err);
  }
}

async function fastTrackHearing(caseId) {
  try {
    const res = await fetch(`/applications/${encodeURIComponent(caseId)}/transition`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_state: "COMMITTEE",
        role: currentRole,
        actor: currentUser.name,
        action: "FAST_TRACK",
        reason: "Low risk profile (GREEN) with impeccable compliance record. Fast-tracked to hearing without EVC inspection."
      })
    });
    const data = await res.json();
    if (!res.ok) {
      showToast("Fast-Track Notice", data.detail || "Fast-track not permitted under current policy.", "warning");
      return;
    }
    showToast("Fast-Tracked", "Case moved directly to Standing Hearing Committee.", "success");
    await viewCaseDetails(caseId);
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to fast-track:", err);
  }
}

// Deficiency Modal Handlers
function openRaiseDeficiencyModal() {
  document.getElementById("raiseDeficiencyModal").classList.add("active");
}

async function handleRaiseDeficiencySubmit(e) {
  e.preventDefault();
  try {
    const category = document.getElementById("raiseCategory").value;
    const desc = document.getElementById("raiseDescription").value;
    const clause = document.getElementById("raiseClause").value;
    const action = document.getElementById("raiseAction").value;

    const res = await fetch(`/applications/${encodeURIComponent(currentCaseId)}/deficiencies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: category,
        description: desc,
        rule_id: "CAD-002",
        handbook_clause: clause,
        required_action: action,
        deadline_days: 14,
        role: currentRole,
        raised_by: currentUser.name
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast("Error", data.detail || "Could not raise deficiency.", "error");
      return;
    }

    closeModal("raiseDeficiencyModal");
    showToast("Deficiency Dispatched", `Deficiency ${data.deficiency.id} dispatched with 14-business-day timeline.`, "warning");
    await viewCaseDetails(currentCaseId);
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to dispatch deficiency:", err);
  }
}

async function promptResubmitDeficiency(defId) {
  const filename = prompt("Enter evidence document filename to upload for rectification:", "Faculty_Recruitment_Board_Roster_Signed.pdf");
  if (!filename) return;

  try {
    const res = await fetch(`/deficiencies/${encodeURIComponent(defId)}/resubmit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        evidence_filename: filename,
        explanation: "Uploaded registrar-certified faculty selection board minutes and appointment rosters.",
        role: "Institution"
      })
    });
    const data = await res.json();
    showToast("Evidence Submitted", `Rectification documents uploaded for ${defId}. Awaiting scrutiny officer verification.`, "success");
    await viewCaseDetails(currentCaseId);
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to resubmit deficiency:", err);
  }
}

async function clearDeficiencyPrompt(defId) {
  const note = prompt("Enter officer verification note to clear deficiency:", "Verified against State Registrar Gazette notifications.");
  if (!note) return;

  try {
    const res = await fetch(`/deficiencies/${encodeURIComponent(defId)}/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        officer_name: currentUser.name,
        notes: note,
        role: currentRole
      })
    });
    showToast("Deficiency Cleared", `Deficiency ${defId} verified and cleared from statutory matrix.`, "success");
    await viewCaseDetails(currentCaseId);
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to clear deficiency:", err);
  }
}

// EVC Modal Handlers
function openScheduleEvcModal(caseId) {
  if (caseId) currentCaseId = caseId;
  document.getElementById("scheduleEvcModal").classList.add("active");
}

async function handleScheduleEvcSubmit(e) {
  e.preventDefault();
  try {
    const date = document.getElementById("evcDate").value;
    const mode = document.getElementById("evcMode").value;
    const notes = document.getElementById("evcNotes").value;

    const res = await fetch(`/evc/inspections?app_id=${encodeURIComponent(currentCaseId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheduled_date: date,
        mode: mode,
        panel_members: ["Prof. H. R. Venkatesh (IITD)", "Dr. Sunita Sen (NITK)"],
        notes: notes,
        role: currentRole
      })
    });
    closeModal("scheduleEvcModal");
    showToast("Inspection Scheduled", `EVC inspection confirmed for ${date}. Expert panel empanelled.`, "success");
    await viewCaseDetails(currentCaseId);
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to schedule EVC:", err);
  }
}

function openSubmitEvcReportModal(caseId) {
  if (caseId) currentCaseId = caseId;
  document.getElementById("submitEvcReportModal").classList.add("active");
}

async function handleSubmitEvcReportSubmit(e) {
  e.preventDefault();
  try {
    const outcome = document.getElementById("evcReportOutcome").value;
    const notes = document.getElementById("evcReportNotes").value;

    const res = await fetch(`/evc/inspections/${encodeURIComponent(currentCaseId)}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: outcome,
        report_notes: notes,
        member_name: currentUser.name,
        role: currentRole
      })
    });
    closeModal("submitEvcReportModal");
    showToast("Observation Report Logged", "Expert observation report filed. Case queued for Committee Hearing.", "success");
    await viewCaseDetails(currentCaseId);
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to submit EVC report:", err);
  }
}

async function submitCommitteeRecommendationPrompt(caseId) {
  const notes = prompt("Enter Committee Minutes & Recommendation Findings:", "Standing Hearing Committee recommends full grant of Letter of Approval for 2026-2027.");
  if (!notes) return;

  showToast("Recommendation Filed", "Committee recommendation recorded. Transmitted to Competent Authority for Statutory Sign-Off.", "success");
  await refreshActiveData();
}

// Statutory Sign-Off Gate
function openDecisionModal(caseId) {
  if (caseId) currentCaseId = caseId;
  document.getElementById("decisionModal").classList.add("active");
}

async function handleDecisionSubmit(e) {
  e.preventDefault();
  try {
    const decType = document.getElementById("decisionTypeSelect").value;
    const notes = document.getElementById("decisionNotes").value;
    const signatory = document.getElementById("decisionSignatory").value;

    const res = await fetch(`/applications/${encodeURIComponent(currentCaseId)}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision_type: decType,
        authority_name: signatory,
        note: notes,
        role: currentRole
      })
    });

    const data = await res.json();
    if (!res.ok) {
      showToast("Sign-Off Blocked", data.detail || "Authority authorization failure.", "error");
      return;
    }

    closeModal("decisionModal");
    showToast("Statutory Order Issued", `Order ${decType} issued under digital seal of Member Secretary.`, "success");
    await viewCaseDetails(currentCaseId);
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to issue decision:", err);
  }
}

// Institution Registration & Self-Check
function openRegistrationModal() {
  document.getElementById("registrationModal").classList.add("active");
}

async function handleRegistrationSubmit(e) {
  e.preventDefault();
  try {
    const name = document.getElementById("regName").value;
    const type = document.getElementById("regType").value;
    const region = document.getElementById("regRegion").value;
    const students = parseInt(document.getElementById("regStudents").value, 10);
    const faculty = parseInt(document.getElementById("regFaculty").value, 10);
    const land = parseFloat(document.getElementById("regLand").value);
    const builtUp = parseFloat(document.getElementById("regBuiltUp").value);

    const res = await fetch("/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        college_name: name,
        app_type: type,
        region: region,
        students: students,
        faculty_count: faculty,
        land_acres: land,
        built_up_sqm: builtUp,
        institution_id: currentUser.institutionId || "INST-DELHI-001"
      })
    });

    const data = await res.json();
    closeModal("registrationModal");
    showToast("Application Registered", `Application ${data.id} filed and placed in Regional Intake Queue.`, "success");
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to register application:", err);
  }
}

async function handleSelfCheckSubmit(e) {
  e.preventDefault();
  try {
    const students = parseInt(document.getElementById("scStudents").value, 10);
    const faculty = parseInt(document.getElementById("scFaculty").value, 10);
    const land = parseFloat(document.getElementById("scLand").value);
    const builtUp = parseFloat(document.getElementById("scBuiltUp").value);
    const labs = parseInt(document.getElementById("scLabs").value, 10);
    const fireDate = document.getElementById("scFireDate").value;

    const res = await fetch("/compliance/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        students: students,
        faculty_count: faculty,
        land_acres: land,
        built_up_sqm: builtUp,
        declared_labs: labs,
        fire_noc_expiry: fireDate
      })
    });

    const data = await res.json();
    const box = document.getElementById("selfCheckResultsBox");
    box.style.display = "block";
    box.innerHTML = `
      <div class="card-top flex-between">
        <strong>Self-Check Preview Results (${data.compliant_count} Compliant, ${data.deficient_count} Deficient)</strong>
        <span class="badge-subtle">[Advisory Simulation]</span>
      </div>
      <div class="rules-container mt-12">
        ${data.rule_results.map((r) => `
          <div class="rule-item ${r.status === 'PASS' ? 'rule-pass' : 'rule-fail'}">
            <div class="rule-header">
              <span class="rule-id">${r.rule_id}: ${r.name}</span>
              <span class="rule-status ${r.status === 'PASS' ? 'status-pass' : 'status-fail'}">${r.status === 'PASS' ? 'COMPLIANT' : 'DEFICIENT'}</span>
            </div>
            <div class="rule-desc">${r.explanation}</div>
            <div class="rule-clause">AICTE Clause: ${r.source_clause}</div>
          </div>
        `).join("")}
      </div>
    `;
  } catch (err) {
    console.error("Self-check error:", err);
  }
}

async function promptAssignOfficer(appId) {
  const officer = prompt("Assign Scrutiny Officer for intake queue:", "Dr. A. K. Sharma");
  if (!officer) return;

  try {
    const res = await fetch(`/applications/${encodeURIComponent(appId)}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        officer_name: officer,
        second_reviewer_name: "Rajeshwari Nair",
        role: currentRole
      })
    });
    showToast("Scrutiny Officer Assigned", `Case ${appId} assigned to ${officer}. Moved to Technical Scrutiny desk.`, "success");
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to assign officer:", err);
  }
}

// --- Faculty Drift Chart SVG (§6.3) ---
async function loadComplianceTrend() {
  try {
    const res = await fetch("/colleges/S5/faculty-trend");
    const trend = await res.json();

    const wrapper = document.getElementById("driftChartWrapper");
    if (!wrapper) return;

    const snaps = trend.snapshots || [];
    const maxVal = 40;
    const w = 800;
    const h = 220;
    const padding = 40;

    let pointsActual = "";
    let pointsReq = "";

    snaps.forEach((s, idx) => {
      const x = padding + (idx * (w - 2 * padding)) / Math.max(1, snaps.length - 1);
      const yAct = h - padding - (s.strength / maxVal) * (h - 2 * padding);
      const yReq = h - padding - (s.required / maxVal) * (h - 2 * padding);
      pointsActual += `${x},${yAct} `;
      pointsReq += `${x},${yReq} `;
    });

    wrapper.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}">
        <!-- Axes -->
        <line x1="${padding}" y1="${h - padding}" x2="${w - padding}" y2="${h - padding}" stroke="#E5E7EB" stroke-width="2"/>
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${h - padding}" stroke="#E5E7EB" stroke-width="2"/>

        <!-- Required Norm Line (Dotted Red) -->
        <polyline points="${pointsReq.trim()}" fill="none" stroke="#EF4444" stroke-width="2" stroke-dasharray="4"/>

        <!-- Active Strength Line (Solid Green/Amber) -->
        <polyline points="${pointsActual.trim()}" fill="none" stroke="#10B981" stroke-width="3"/>

        <!-- Inspection Marker (Month 5 / March 2026) -->
        <line x1="${padding + 4 * ((w - 2 * padding) / 11)}" y1="${padding}" x2="${padding + 4 * ((w - 2 * padding) / 11)}" y2="${h - padding}" stroke="#3B82F6" stroke-width="2" stroke-dasharray="2"/>
        <text x="${padding + 4 * ((w - 2 * padding) / 11) - 20}" y="${padding - 8}" font-size="10" fill="#1D4ED8" font-weight="bold">Inspection</text>

        <!-- Data points -->
        ${snaps.map((s, idx) => {
          const x = padding + (idx * (w - 2 * padding)) / Math.max(1, snaps.length - 1);
          const y = h - padding - (s.strength / maxVal) * (h - 2 * padding);
          const isShort = s.shortfall > 0;
          return `
            <circle cx="${x}" cy="${y}" r="4" fill="${isShort ? '#EF4444' : '#10B981'}"/>
            <text x="${x - 12}" y="${h - padding + 16}" font-size="9" fill="#6B7280">${s.month.split("-")[1]}</text>
          `;
        }).join("")}
      </svg>
    `;

    // Alerts
    const alertsContainer = document.getElementById("driftAlertsContainer");
    if (alertsContainer) {
      alertsContainer.innerHTML = (trend.alerts || []).map((a) => `
        <div class="drift-alert-item alert-danger">
          <strong>⚠️ ${a.type}:</strong> ${a.message}
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("Failed to load drift trend:", err);
  }
}

// --- Document Vault (§1.2 #6) ---
async function loadDocumentsVault() {
  try {
    const res = await fetch(`/applications/${encodeURIComponent(currentCaseId)}/documents`);
    const docs = await res.json();

    const grid = document.getElementById("documentsGrid");
    if (!grid) return;
    grid.innerHTML = "";

    docs.forEach((d) => {
      const card = document.createElement("div");
      card.className = "document-card";
      card.innerHTML = `
        <div class="doc-card-header">
          <span style="font-size: 1.5rem;">📄</span>
          <div>
            <strong>${d.name}</strong>
            <div style="font-size: 0.72rem; color: var(--text-muted);">${d.type}</div>
          </div>
        </div>
        <div class="mt-12" style="font-size: 0.8rem;">
          <div>Declared: <strong>${d.declared_expiry || d.declared_area || d.declared_built_up}</strong></div>
          <div>Extracted: <strong>${d.extracted_expiry || d.extracted_area || d.extracted_built_up}</strong></div>
          <div>Status: <span class="badge-${d.status === 'VERIFIED' ? 'success' : 'danger'}">${d.status}</span></div>
        </div>
        <div class="doc-card-footer mt-12">
          <code>SHA-256: ${d.sha256.substring(0, 16)}...</code>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load documents vault:", err);
  }
}

// --- Audit Ledger (§6.5) ---
async function loadAuditLedger() {
  try {
    const res = await fetch("/audit/ledger");
    const chain = await res.json();

    const tbody = document.getElementById("auditTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    chain.forEach((block) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>#${block.id}</strong></td>
        <td><small>${new Date(block.ts).toLocaleString()}</small></td>
        <td><strong>${block.actor}</strong><br><small class="text-muted">${block.role}</small></td>
        <td><span class="badge-subtle">${block.action}</span></td>
        <td><small>${block.entity}:${block.entity_id}</small></td>
        <td><code>${block.hash.substring(0, 16)}...</code></td>
        <td><code>${block.prev_hash.substring(0, 16)}...</code></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to load audit ledger:", err);
  }
}

async function verifyAuditLedger() {
  try {
    const res = await fetch("/audit/verify");
    const data = await res.json();
    const statusText = document.getElementById("chainStatusText");

    if (data.valid) {
      statusText.innerHTML = `<span class="text-success font-bold">✓ Cryptographically Verified: All ${data.total_entries} blocks match immutable SHA-256 hash signatures. Latest: ${data.latest_block_hash.substring(0, 16)}...</span>`;
      showToast("Chain Verified", "Cryptographic ledger integrity verified. Zero tampering detected.", "success");
    } else {
      statusText.innerHTML = `<span class="text-danger font-bold">❌ Tampering Detected at Block #${data.error_at_index}: ${data.message}</span>`;
      showToast("Integrity Alert", "Hash mismatch detected in audit chain.", "error");
    }
  } catch (err) {
    console.error("Verification error:", err);
  }
}

async function loadRecentActivity() {
  try {
    const res = await fetch("/activity?limit=10");
    const list = await res.json();

    const container = document.getElementById("activityFeedList");
    if (!container) return;
    container.innerHTML = "";

    list.forEach((item) => {
      const div = document.createElement("div");
      div.className = "activity-item";
      div.innerHTML = `
        <div class="act-time">${new Date(item.ts).toLocaleTimeString()}</div>
        <div class="act-action">${item.actor} &bull; ${item.action}</div>
        <div class="act-details">${typeof item.details === 'string' ? item.details : JSON.stringify(item.details)}</div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Failed to load recent activity:", err);
  }
}

// --- Simulation Time & Reset Controls ---
async function advanceSimTime(days) {
  try {
    const res = await fetch("/demo/advance-clock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: days })
    });
    const data = await res.json();
    currentSimulatedDays = data.simulated_days;
    document.getElementById("simTimeDisplay").textContent = `Simulated Clock: +${currentSimulatedDays} Days (${currentSimulatedDays > 5 ? 'Escalations Active' : 'Normal'})`;
    showToast("Clock Advanced", `Simulated time moved +${days} days (Total: +${currentSimulatedDays}d). SLAs updated.`, "info");
    await refreshActiveData();
    if (document.getElementById("appDetailModal").classList.contains("active")) {
      await viewCaseDetails(currentCaseId);
    }
  } catch (err) {
    console.error("Failed to advance time:", err);
  }
}

async function resetDemoState() {
  if (!confirm("Reset all 8 canonical scenarios and simulation clocks back to baseline?")) return;
  try {
    const res = await fetch("/demo/reset", { method: "POST" });
    const data = await res.json();
    currentSimulatedDays = 0;
    document.getElementById("simTimeDisplay").textContent = "Simulated Clock: Day 0 (Normal)";
    showToast("Demo Reset", "All 8 canonical scenarios and audit ledger reset to baseline.", "success");
    await loadScenarios();
    await refreshActiveData();
  } catch (err) {
    console.error("Failed to reset demo state:", err);
  }
}

function toggleNotifModal() {
  showToast("Statutory Notifications", "3 alerts pending: Rural Engineering unassigned (>48h SLA), Sunrise Institute cadre shortfall, Metropolitan FDR lien resubmitted.", "warning", 6000);
}

// --- Toast System ---
function showToast(title, message, type = "info", duration = 4000) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;

  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  else if (type === "error") icon = "❌";
  else if (type === "warning") icon = "⚠️";

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="dismissToast(this.parentElement)">&times;</button>
  `;

  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(el) {
  if (!el) return;
  el.classList.add("removing");
  setTimeout(() => { if (el.parentElement) el.parentElement.removeChild(el); }, 200);
}
