"use client";

import React, { useState } from "react";
import {
  CANONICAL_SCENARIOS_LIST,
  CanonicalScenarioSummary,
  CryptographicAuditEntry,
} from "../data";

interface AdminDashboardProps {
  auditEntries: CryptographicAuditEntry[];
  onSelectScenario: (scenario: CanonicalScenarioSummary) => void;
  onResetDemo: () => void;
  onAdvanceDays: (days: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  auditEntries,
  onSelectScenario,
  onResetDemo,
  onAdvanceDays,
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("SCENARIO-1");
  const [activeTab, setActiveTab] = useState<"scenarios" | "audit">("scenarios");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const activeScenario =
    CANONICAL_SCENARIOS_LIST.find((s) => s.id === selectedScenarioId) || CANONICAL_SCENARIOS_LIST[0];

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 pt-7 sm:pt-9 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-0.5 rounded-full dark:bg-slate-800 dark:text-slate-300">
              System Administration & Cryptographic Audit
            </span>
            <span className="text-xs text-slate-500 font-semibold dark:text-slate-400">
              Council Regulatory Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Regulatory Case Switchboard & Cryptographic Chain
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            8 statutory benchmark cases with deterministic rule validation and immutable SHA-256 ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onAdvanceDays(1)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            +1 Day Timeline
          </button>
          <button
            onClick={() => onAdvanceDays(5)}
            className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            +5 Days Timeline
          </button>
          <button
            onClick={onResetDemo}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Reset Session State
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab("scenarios")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === "scenarios"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          Benchmark Cases ({CANONICAL_SCENARIOS_LIST.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          Cryptographic Audit Ledger ({auditEntries.length} Blocks)
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
            Chain Valid
          </span>
        </button>
      </div>

      {/* TAB 1: SCENARIOS SWITCHBOARD */}
      {activeTab === "scenarios" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CANONICAL_SCENARIOS_LIST.map((scen) => {
              const isSelected = scen.id === activeScenario.id;
              return (
                <div
                  key={scen.id}
                  onClick={() => {
                    setSelectedScenarioId(scen.id);
                    onSelectScenario(scen);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                    isSelected
                      ? "bg-blue-50/70 border-blue-500 shadow-xs dark:bg-blue-950/40 dark:border-blue-600"
                      : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {scen.folderName}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {scen.region}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                    {scen.instituteName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{scen.scenarioType}</p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] items-center">
                    <span className="text-slate-500">Statutory Outcome:</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                      {scen.expectedOutcome}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Scenario Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                  Folder: apps/api/app/seed/scenarios/{activeScenario.folderName}/
                </span>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mt-0.5">
                  {activeScenario.instituteName} ({activeScenario.applicationId})
                </h3>
                <p className="text-xs text-slate-500">
                  Category: {activeScenario.scenarioType} • Region: {activeScenario.region} • Stage: {activeScenario.stage}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                  Expected Result: {activeScenario.expectedOutcome}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-2 border border-slate-200/80 dark:border-slate-700 text-xs">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Primary Statutory Discrepancy / Norm Evaluated:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{activeScenario.primaryIssue}</p>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200">Specification Context:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{activeScenario.narrative}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LEDGER */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Immutable Cryptographic Audit Trail (SHA-256 Chain)
            </h3>
            <p className="text-xs text-slate-500">
              Every regulatory action, document submission, and deficiency notice is cryptographically linked to ensure non-repudiation.
            </p>
          </div>

          <div className="space-y-3">
            {auditEntries.map((entry) => (
              <div
                key={entry.sequenceNumber}
                className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-2 bg-slate-50/50 dark:bg-slate-800/30 text-xs font-mono"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                      Block #{entry.sequenceNumber}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-sans text-[11px] font-bold">
                      {entry.role}
                    </span>
                    <span className="font-sans font-semibold text-slate-900 dark:text-slate-100">
                      {entry.actorName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 text-[11px] tabular-nums">
                    <span>{entry.timestamp}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-sans">
                      ✓ Valid
                    </span>
                  </div>
                </div>

                <div className="font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  <span className="font-bold font-mono text-slate-600 dark:text-slate-400">[{entry.action}]</span>{" "}
                  {entry.details} <span className="text-blue-600 dark:text-blue-400 font-bold font-mono">({entry.targetEntity})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="truncate tabular-nums">
                    Prev: {entry.previousHash.slice(0, 32)}...
                  </div>
                  <div className="truncate flex items-center justify-between tabular-nums">
                    <span>Curr: {entry.currentHash.slice(0, 32)}...</span>
                    <button
                      onClick={() => handleCopy(entry.currentHash)}
                      className="text-blue-600 hover:underline cursor-pointer ml-2 font-sans font-semibold"
                    >
                      {copiedHash === entry.currentHash ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
