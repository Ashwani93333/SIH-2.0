"use client";

import React, { useState } from "react";
import {
  MOCK_EVC_COORDINATOR,
  MOCK_EMPANELLED_EXPERTS,
  MOCK_EVC_INSPECTIONS,
  EmpanelledExpert,
  EvcInspectionItem,
} from "../data";

interface EvcDashboardProps {
  onAddAuditEntry: (action: string, target: string, details: string) => void;
}

export const EvcDashboard: React.FC<EvcDashboardProps> = ({
  onAddAuditEntry,
}) => {
  const [inspections, setInspections] = useState<EvcInspectionItem[]>(MOCK_EVC_INSPECTIONS);
  const [experts] = useState<EmpanelledExpert[]>(MOCK_EMPANELLED_EXPERTS);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [targetAppId, setTargetAppId] = useState("AICTE/2026/APP-1038");
  const [targetCollege, setTargetCollege] = useState("Greenfield Institute of Engineering");
  const [selectedExpert1, setSelectedExpert1] = useState("Dr. Anita Roy");
  const [selectedExpert2, setSelectedExpert2] = useState("Dr. Pradeep Choksi");
  const [scheduledDate, setScheduledDate] = useState("2026-03-24");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleScheduleInspection = (e: React.FormEvent) => {
    e.preventDefault();
    const newVisit: EvcInspectionItem = {
      id: `EVC-VISIT-${Math.floor(1060 + Math.random() * 40)}`,
      applicationId: targetAppId,
      instituteName: targetCollege,
      instituteAddress: "Industrial Area, Sector 24, Faridabad, Haryana",
      visitType: "PHYSICAL_ON_SITE",
      scheduledDate,
      inspectors: [selectedExpert1, selectedExpert2],
      geoCoordinates: { lat: 28.4089, lng: 77.3178 },
      inspectionStatus: "SCHEDULED",
      inspectorSummaryNotes: `Scheduled on-site verification with ${selectedExpert1} and ${selectedExpert2}. Conflict of interest clearance authenticated.`,
    };

    setInspections([newVisit, ...inspections]);
    setShowScheduleModal(false);
    setActionNotice(`Inspection scheduled for ${targetCollege} on ${scheduledDate}. Formal appointment dispatched.`);
    onAddAuditEntry(
      "SCHEDULED_EVC_VISIT",
      targetAppId,
      `Prof. Ramesh Rao scheduled on-site inspection on ${scheduledDate} with ${selectedExpert1} & ${selectedExpert2}.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleSignOffReport = (visitId: string) => {
    setInspections((prev) =>
      prev.map((i) =>
        i.id === visitId
          ? {
              ...i,
              inspectionStatus: "REPORT_SUBMITTED",
              overallVerdict: "SATISFACTORY",
              verificationFindings: {
                landBoundariesVerified: true,
                laboratoriesEquipped: true,
                facultyBiometricMatched: true,
                fireExitRampsOperational: true,
                libraryVolumeCount: 22400,
                pcStudentRatioMatched: true,
              },
            }
          : i
      )
    );

    setActionNotice(`Inspection report for ${visitId} signed and submitted to Council Gate.`);
    onAddAuditEntry(
      "EVC_REPORT_SUBMITTED",
      visitId,
      `EVC observation report authenticated with SATISFACTORY verdict.`
    );
    setTimeout(() => setActionNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Executive Command Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 pt-7 sm:pt-9 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-0.5 rounded-full dark:bg-blue-950/80 dark:border-blue-800 dark:text-blue-300">
              EVC Operations Directorate
            </span>
            <span className="text-xs text-slate-500 font-semibold dark:text-slate-400">
              National Empanelment Cell
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {MOCK_EVC_COORDINATOR.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {MOCK_EVC_COORDINATOR.designation} • {MOCK_EVC_COORDINATOR.headquarters}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Schedule On-Site Inspection
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 dark:text-emerald-300 dark:hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Grid: Scheduled Inspections (2 Cols) & Expert Pool (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Scheduled Inspections */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Active & Scheduled On-Site Inspections
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-full dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 tabular-nums">
                {inspections.length}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              GPS Geo-fenced Tracking
            </span>
          </div>

          <div className="space-y-4">
            {inspections.map((visit) => {
              const isSubmitted = visit.inspectionStatus === "REPORT_SUBMITTED";

              return (
                <div
                  key={visit.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800">
                          {visit.id}
                        </span>
                        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                          {visit.applicationId}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {visit.instituteName}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>📍</span>
                        <span>{visit.instituteAddress}</span>
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-1">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full border ${
                          isSubmitted
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800"
                        }`}
                      >
                        {visit.inspectionStatus.replace(/_/g, " ")}
                      </span>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <span>📅</span>
                        <span className="tabular-nums font-semibold">{visit.scheduledDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Inspectors & GPS Badge */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Empanelled Inspectors:
                      </span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {visit.inspectors.join(" & ")}
                      </span>
                    </div>
                    {visit.geoCoordinates && (
                      <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                        <span>🛰️</span>
                        <span>
                          {visit.geoCoordinates.lat.toFixed(4)}° N, {visit.geoCoordinates.lng.toFixed(4)}° E
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Verified Findings Checklist */}
                  {visit.verificationFindings && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-900">
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="font-bold">✓</span> Land Boundaries: Verified
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="font-bold">✓</span> Labs Equipped: Verified
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="font-bold">✓</span> Biometric Roster: 100%
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="font-bold">✓</span> Fire Exits: Operational
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="font-bold">✓</span> Library: {visit.verificationFindings.libraryVolumeCount.toLocaleString()} vols
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-medium">
                        <span className="font-bold">✓</span> Computing Ratio: Matched
                      </div>
                    </div>
                  )}

                  {/* Inspector Notes */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Inspector Brief:</span>{" "}
                    {visit.inspectorSummaryNotes}
                  </div>

                  {/* Action Bar */}
                  {!isSubmitted && (
                    <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleSignOffReport(visit.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <span>✓</span> Authenticate & Submit Observation Report
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Empanelled Expert Pool */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Empanelled Expert Roster
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full dark:bg-slate-800 dark:text-slate-300 tabular-nums">
                {experts.length}
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              Conflict Clear
            </span>
          </div>

          <div className="space-y-3">
            {experts.map((exp) => (
              <div
                key={exp.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {exp.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{exp.institution}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      exp.status === "AVAILABLE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800"
                    }`}
                  >
                    {exp.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Discipline:</span>{" "}
                  {exp.discipline}
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-medium">Experience: {exp.experienceYears} Years</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span>✓</span> Verified Clear
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SCHEDULE INSPECTION MODAL */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Schedule On-Site Inspection (EVC)
              </h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleInspection} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Application Docket ID
                </label>
                <input
                  type="text"
                  value={targetAppId}
                  onChange={(e) => setTargetAppId(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={targetCollege}
                  onChange={(e) => setTargetCollege(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Lead Expert Inspector (Chair)
                </label>
                <select
                  value={selectedExpert1}
                  onChange={(e) => setSelectedExpert1(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {experts.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} — {e.discipline}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Domain Expert Inspector 2
                </label>
                <select
                  value={selectedExpert2}
                  onChange={(e) => setSelectedExpert2(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {experts.map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} — {e.discipline}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Inspection Date
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 tabular-nums"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
