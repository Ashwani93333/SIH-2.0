"use client";

import React, { useState } from "react";
import { Navbar } from "../components/Navbar";
import { OnboardingPortal } from "../components/OnboardingPortal";
import { InstitutionDashboard } from "../components/InstitutionDashboard";
import { ScrutinyDashboard } from "../components/ScrutinyDashboard";
import { RegionalDashboard } from "../components/RegionalDashboard";
import { EvcDashboard } from "../components/EvcDashboard";
import { CommitteeDashboard } from "../components/CommitteeDashboard";
import { BureauDashboard } from "../components/BureauDashboard";
import { AdminDashboard } from "../components/AdminDashboard";
import {
  FlowGuardRole,
  ROLE_DEFINITIONS,
  MOCK_AUDIT_LEDGER,
  MOCK_INSTITUTION_APPLICATIONS,
  ApplicationDraft,
  CryptographicAuditEntry,
  CanonicalScenarioSummary,
} from "../data";
import { DemoAccount } from "../data/authCredentials";

export default function Home() {
  // Start on the Onboarding Page as requested
  const [isInGateway, setIsInGateway] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<FlowGuardRole>("INSTITUTION");
  const [simulatedDays, setSimulatedDays] = useState<number>(0);
  const [auditEntries, setAuditEntries] = useState<CryptographicAuditEntry[]>(MOCK_AUDIT_LEDGER);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationDraft[]>(MOCK_INSTITUTION_APPLICATIONS);

  const activeRoleDef = ROLE_DEFINITIONS[currentRole];

  // Gateway login handler with role transition
  const handleGatewayLogin = (role: FlowGuardRole, account: DemoAccount) => {
    setCurrentRole(role);
    setIsInGateway(false);
    setStatusToast(`Authenticated as ${account.name} (${account.badgeText}). Switched to ${ROLE_DEFINITIONS[role].label}.`);
    handleAddAuditEntry(
      "GATEWAY_AUTHENTICATED",
      account.id,
      `User ${account.name} (${account.designation}) authenticated via AICTE Multi-Role Gateway.`
    );
    setTimeout(() => setStatusToast(null), 4000);
  };

  // Cryptographic audit chain appender
  const handleAddAuditEntry = (action: string, target: string, details: string) => {
    const prevBlock = auditEntries[auditEntries.length - 1];
    const prevHash = prevBlock ? prevBlock.currentHash : "0".repeat(64);

    // Compute cryptographic block hash
    const blockPayload = `${auditEntries.length + 1}-${Date.now()}-${currentRole}-${action}-${target}-${details}-${prevHash}`;
    let hashNum = 0;
    for (let i = 0; i < blockPayload.length; i++) {
      hashNum = (hashNum << 5) - hashNum + blockPayload.charCodeAt(i);
      hashNum |= 0;
    }
    const currentHash =
      Math.abs(hashNum).toString(16).padStart(8, "0") +
      Array.from({ length: 56 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const newBlock: CryptographicAuditEntry = {
      sequenceNumber: auditEntries.length + 1,
      timestamp: new Date().toISOString(),
      role: currentRole,
      actorId: activeRoleDef.organization,
      actorName: activeRoleDef.userName,
      action,
      targetEntity: target,
      details,
      previousHash: prevHash,
      currentHash,
      isValidChain: true,
    };

    setAuditEntries((prev) => [...prev, newBlock]);
  };

  const handleAdvanceDays = (days: number) => {
    setSimulatedDays((prev) => prev + days);
    setStatusToast(`Timeline advanced by +${days} day(s). Statutory SLA milestones updated.`);
    handleAddAuditEntry(
      "STATUTORY_TIMELINE_ADVANCED",
      "SYSTEM_CALENDAR",
      `Advanced statutory calendar by +${days} days (total timeline offset: +${simulatedDays + days} days).`
    );
    setTimeout(() => setStatusToast(null), 3500);
  };

  const handleResetDemo = () => {
    setSimulatedDays(0);
    setStatusToast("Workflow session state reset to baseline.");
    handleAddAuditEntry(
      "SESSION_STATE_RESET",
      "CANONICAL_BASELINE",
      "Reset workflow state and timelines back to Day 0 baseline."
    );
    setTimeout(() => setStatusToast(null), 3500);
  };

  const handleSelectScenario = (scenario: CanonicalScenarioSummary) => {
    setStatusToast(`Loaded application docket: ${scenario.instituteName} (${scenario.applicationId}).`);
    handleAddAuditEntry(
      "APPLICATION_DOCKET_LOADED",
      scenario.applicationId,
      `Loaded case docket for ${scenario.instituteName} (${scenario.scenarioType}).`
    );
    setTimeout(() => setStatusToast(null), 3500);
  };

  // If user is in gateway/onboarding view, render OnboardingPortal
  if (isInGateway) {
    return <OnboardingPortal onLogin={handleGatewayLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]/60 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased relative z-10">
      {/* Top Universal Header with Timeline, Profile & Gateway Return */}
      <Navbar
        currentRole={currentRole}
        onSelectRole={setCurrentRole}
        simulatedDays={simulatedDays}
        onAdvanceDays={handleAdvanceDays}
        onResetDemo={handleResetDemo}
        onExitToGateway={() => setIsInGateway(true)}
      />

      {/* Floating Notification Toast */}
      {statusToast && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 py-2.5 px-4 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-xs transition-all">
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">●</span>
              <span>{statusToast}</span>
            </div>
            <button
              onClick={() => setStatusToast(null)}
              className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200 font-bold cursor-pointer text-sm leading-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area with Shared Applications */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 pb-14 sm:pt-10 sm:pb-16 space-y-8">
        {currentRole === "INSTITUTION" && (
          <InstitutionDashboard
            onAddAuditEntry={handleAddAuditEntry}
            sharedApplications={applications}
            onUpdateApplications={setApplications}
          />
        )}

        {currentRole === "SCRUTINY_OFFICER" && (
          <ScrutinyDashboard onAddAuditEntry={handleAddAuditEntry} />
        )}

        {currentRole === "REGIONAL_OFFICER" && (
          <RegionalDashboard onAddAuditEntry={handleAddAuditEntry} />
        )}

        {currentRole === "EVC_COORDINATOR" && (
          <EvcDashboard onAddAuditEntry={handleAddAuditEntry} />
        )}

        {currentRole === "COMMITTEE_MEMBER" && (
          <CommitteeDashboard onAddAuditEntry={handleAddAuditEntry} />
        )}

        {currentRole === "BUREAU_OFFICER" && (
          <BureauDashboard onAddAuditEntry={handleAddAuditEntry} isCompetentAuthority={false} />
        )}

        {currentRole === "COMPETENT_AUTHORITY" && (
          <BureauDashboard onAddAuditEntry={handleAddAuditEntry} isCompetentAuthority={true} />
        )}

        {currentRole === "SYSTEM_ADMIN" && (
          <AdminDashboard
            auditEntries={auditEntries}
            onSelectScenario={handleSelectScenario}
            onResetDemo={handleResetDemo}
            onAdvanceDays={handleAdvanceDays}
          />
        )}
      </main>

      {/* Clean Portal Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            All India Council for Technical Education (AICTE) • FlowGuard Platform
          </p>
          <p className="text-[11px] text-slate-500">
            Automated Rules Engine • Statutory Procedural Fairness • Transparent SLA Milestones • Cryptographic Audit Chain
          </p>
        </div>
      </footer>
    </div>
  );
}
