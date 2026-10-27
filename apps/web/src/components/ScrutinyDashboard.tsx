"use client";

import React, { useState } from "react";
import {
  MOCK_SCRUTINY_OFFICER,
  MOCK_SCRUTINY_DOCKETS,
  ScrutinyDocket,
} from "../data";

interface ScrutinyDashboardProps {
  onAddAuditEntry: (action: string, target: string, details: string) => void;
}

export const ScrutinyDashboard: React.FC<ScrutinyDashboardProps> = ({
  onAddAuditEntry,
}) => {
  const [dockets, setDockets] = useState<ScrutinyDocket[]>(MOCK_SCRUTINY_DOCKETS);
  const [selectedAppId, setSelectedAppId] = useState<string>("AICTE/2026/APP-1042");
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const activeDocket = dockets.find((d) => d.applicationId === selectedAppId) || dockets[0];

  const handleClearRuleFlag = (flagId: string) => {
    setDockets((prev) =>
      prev.map((d) =>
        d.applicationId === activeDocket.applicationId
          ? {
              ...d,
              flags: d.flags.map((f) =>
                f.id === flagId ? { ...f, status: "VERIFIED_OK", notes: "Officer verified & cleared." } : f
              ),
            }
          : d
      )
    );
    setActionMessage(`Rule requirement ${flagId} authenticated and cleared.`);
    onAddAuditEntry("RULE_FLAG_CLEARED", activeDocket.applicationId, `Scrutiny Officer verified requirement ${flagId}.`);
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleRecommendEVC = () => {
    setDockets((prev) =>
      prev.map((d) =>
        d.applicationId === activeDocket.applicationId
          ? { ...d, overallRecommendation: "RECOMMEND_EVC_VISIT", lastActionNotes: "Recommended for on-site physical inspection." }
          : d
      )
    );
    setActionMessage("Docket recommended for Expert Visit Committee (EVC) on-site verification.");
    onAddAuditEntry(
      "RECOMMENDED_EVC_VISIT",
      activeDocket.applicationId,
      `Dr. A. K. Sharma recommended ${activeDocket.applicationId} for on-site physical EVC verification.`
    );
    setTimeout(() => setActionMessage(null), 4000);
  };

  const handleIssueDeficiency = () => {
    setActionMessage("Statutory 14-day deficiency notice dispatched to college registrar.");
    onAddAuditEntry(
      "STATUTORY_DEFICIENCY_DISPATCHED",
      activeDocket.applicationId,
      `14-day statutory deficiency cure notice issued for ${activeDocket.applicationId}.`
    );
    setTimeout(() => setActionMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Officer Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 pt-7 sm:pt-9 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-0.5 rounded-full dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300">
              Technical Scrutiny Desk
            </span>
            <span className="text-xs text-slate-500 font-mono font-semibold dark:text-slate-400">
              ID: {MOCK_SCRUTINY_OFFICER.id}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {MOCK_SCRUTINY_OFFICER.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {MOCK_SCRUTINY_OFFICER.title} • {MOCK_SCRUTINY_OFFICER.region} • Specialization: {MOCK_SCRUTINY_OFFICER.specialization}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center min-w-24">
            <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">{dockets.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Active Dockets</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center min-w-24">
            <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">4</div>
            <div className="text-[11px] text-slate-500 font-medium">Cleared Today</div>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-950 dark:text-emerald-300 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Main Split: Docket Queue & Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Dockets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Assigned Workload Queue
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full dark:bg-slate-800 dark:text-slate-300 tabular-nums">
              {dockets.length}
            </span>
          </div>

          <div className="space-y-3">
            {dockets.map((dock) => {
              const deficientCount = dock.flags.filter((f) => f.status === "FLAGGED_DEFICIENT").length;
              const isSelected = dock.applicationId === activeDocket.applicationId;

              return (
                <div
                  key={dock.applicationId}
                  onClick={() => setSelectedAppId(dock.applicationId)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? "bg-emerald-50/70 border-emerald-500 shadow-xs dark:bg-emerald-950/40 dark:border-emerald-600"
                      : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {dock.applicationId}
                    </span>
                    {deficientCount > 0 ? (
                      <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800">
                        {deficientCount} Deficient
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800">
                        Norms Satisfied
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {dock.instituteName}
                  </h3>
                  <div className="flex justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>Due: {dock.slaDeadline}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{dock.slaUsedPercent}% SLA used</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Rule Verification & Decision Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {activeDocket.applicationId}
                </span>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {activeDocket.instituteName}
                </h2>
                <p className="text-xs text-slate-500">
                  Region: {activeDocket.region} • Received: {activeDocket.receivedDate} • Target SLA: 10 Days
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleIssueDeficiency}
                  className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Issue 14-Day Notice
                </button>
                <button
                  onClick={handleRecommendEVC}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                >
                  Recommend EVC Visit
                </button>
              </div>
            </div>

            {/* AI Rule Extraction Flags */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Statutory Rule Verifications & Extraction Evidence
                </h3>
                <span className="text-xs text-slate-500 font-semibold tabular-nums">
                  {activeDocket.flags.length} Norms Analyzed
                </span>
              </div>

              <div className="space-y-3.5">
                {activeDocket.flags.map((flag) => (
                  <div
                    key={flag.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                            {flag.ruleCode}
                          </span>
                          <span className="text-xs text-slate-500">• {flag.category}</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {flag.ruleName}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                          OCR: {Math.round(flag.aiConfidence * 100)}%
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            flag.status === "VERIFIED_OK"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800"
                              : flag.status === "FLAGGED_DEFICIENT"
                              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {flag.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div>
                        <span className="text-slate-500">Extracted Parameter:</span>{" "}
                        <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{flag.extractedValue}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Statutory Norm:</span>{" "}
                        <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">{flag.mandatoryNorm}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Evidence Citation:</span>{" "}
                      {flag.evidenceText}
                      <span className="text-slate-500 font-mono text-[11px] ml-1">
                        [{flag.documentSource}{flag.pageNumber ? ` p.${flag.pageNumber}` : ""}]
                      </span>
                    </div>

                    {flag.notes && (
                      <div className="text-xs text-amber-900 dark:text-amber-200 bg-amber-50/80 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200/80 dark:border-amber-900">
                        ℹ️ {flag.notes}
                      </div>
                    )}

                    {flag.status !== "VERIFIED_OK" && (
                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => handleClearRuleFlag(flag.id)}
                          className="px-3.5 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold cursor-pointer shadow-2xs"
                        >
                          Mark Verified & Clear
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendation Banner */}
            <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  Scrutiny Recommendation Summary
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {activeDocket.overallRecommendation?.replace(/_/g, " ") || "Under Scrutiny"}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  {activeDocket.lastActionNotes || "Analyzing appointment letters and municipal clearance."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
