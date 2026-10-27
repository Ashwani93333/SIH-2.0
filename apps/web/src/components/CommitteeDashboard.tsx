"use client";

import React, { useState } from "react";
import {
  MOCK_COMMITTEE_CHAIR,
  MOCK_COMMITTEE_MEMBERS,
  MOCK_HEARING_DOCKET,
  HearingCaseItem,
} from "../data";

interface CommitteeDashboardProps {
  onAddAuditEntry: (action: string, target: string, details: string) => void;
}

export const CommitteeDashboard: React.FC<CommitteeDashboardProps> = ({
  onAddAuditEntry,
}) => {
  const [cases, setCases] = useState<HearingCaseItem[]>(MOCK_HEARING_DOCKET);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("HEAR-1035");
  const [hearingDecision, setHearingDecision] = useState<HearingCaseItem["committeeDecision"]>("GRANT_CONDITIONAL_30_DAYS");
  const [minutesText, setMinutesText] = useState("");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  const handleRecordResolution = () => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === activeCase.id
          ? {
              ...c,
              committeeDecision: hearingDecision,
              resolutionMinutes: minutesText || c.resolutionMinutes,
            }
          : c
      )
    );

    setActionNotice(`Resolution recorded for ${activeCase.instituteName}. Decision forwarded to Member Secretary.`);
    onAddAuditEntry(
      "HEARING_RESOLUTION_ADOPTED",
      activeCase.applicationId,
      `Standing Hearing Committee resolved ${hearingDecision} for ${activeCase.applicationId} (${activeCase.votesInFavor}-${activeCase.votesAgainst} vote).`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Committee Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 pt-7 sm:pt-9 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-0.5 rounded-full dark:bg-rose-950/80 dark:border-rose-800 dark:text-rose-300">
              Standing Hearing Committee (SHC)
            </span>
            <span className="text-xs text-slate-500 font-semibold dark:text-slate-400">
              Central Bench Quorum: 3 Statutory Members
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {MOCK_COMMITTEE_CHAIR.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {MOCK_COMMITTEE_CHAIR.title} • Statutory Appellate Jurisdiction
          </p>
        </div>

        <div className="flex items-center gap-2">
          {MOCK_COMMITTEE_MEMBERS.map((m) => (
            <div
              key={m.id}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs"
              title={`${m.name} (${m.role})`}
            >
              {m.name.split(" ")[1]?.charAt(0) || "M"}
            </div>
          ))}
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-950 dark:text-emerald-300 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 2-Column Split: Hearing Docket & Adjudication Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Hearing Cases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Scheduled Hearing Docket
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full dark:bg-slate-800 dark:text-slate-300 tabular-nums">
              {cases.length}
            </span>
          </div>

          <div className="space-y-3">
            {cases.map((c) => {
              const isSelected = c.id === activeCase.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCaseId(c.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? "bg-rose-50/70 border-rose-500 shadow-xs dark:bg-rose-950/40 dark:border-rose-600"
                      : "bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {c.applicationId}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {c.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {c.instituteName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{c.primaryDiscrepancy}</p>
                  <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 tabular-nums">
                    Hearing Date: {c.hearingDate}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Adjudication Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {activeCase.applicationId}
                </span>
                <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full font-bold dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800">
                  {activeCase.category.replace(/_/g, " ")}
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {activeCase.instituteName}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bench Members Present: {activeCase.benchMembers.join(", ")} • Quorum Verified (3/3)
              </p>
            </div>

            {/* Discrepancy & Oral Representation */}
            <div className="space-y-3">
              <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900 p-4 rounded-xl space-y-1">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Primary Statutory Discrepancy
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {activeCase.primaryDiscrepancy}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl space-y-1 border border-slate-200/80 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  College Representation & Pleadings
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {activeCase.collegeRepresentationSummary}
                </p>
              </div>

              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900 p-4 rounded-xl space-y-1">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  Legal Statutory Advisory Opinion
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  {activeCase.legalAdvisorNote}
                </p>
              </div>
            </div>

            {/* Bench Resolution Formulation */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4 bg-slate-50/50 dark:bg-slate-800/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Formulate Standing Hearing Committee Resolution
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Recommendation Order
                  </label>
                  <select
                    value={hearingDecision}
                    onChange={(e) => setHearingDecision(e.target.value as HearingCaseItem["committeeDecision"])}
                    className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold"
                  >
                    <option value="GRANT_CONDITIONAL_30_DAYS">Grant Conditional 30 Days (TDR / Affiliation)</option>
                    <option value="RECOMMEND_APPROVAL">Recommend Full Approval</option>
                    <option value="RECOMMEND_REJECTION">Recommend Statutory Rejection Order</option>
                    <option value="ORDER_FRESH_EVC">Order Fresh Surprise EVC Re-visit</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Bench Vote (Quorum: 3 Members)
                  </label>
                  <div className="text-xs font-mono p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                    In Favor: {activeCase.votesInFavor} | Against: {activeCase.votesAgainst} (Unanimous)
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Hearing Minutes & Legal Findings
                </label>
                <textarea
                  rows={3}
                  value={minutesText || activeCase.resolutionMinutes || ""}
                  onChange={(e) => setMinutesText(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  placeholder="Record formal statutory resolution findings..."
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleRecordResolution}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Adopt & Sign Bench Minutes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
