"use client";

import React, { useState } from "react";
import {
  MOCK_REGIONAL_OFFICER,
  MOCK_REGIONAL_STAFF,
  MOCK_REGIONAL_APPLICATIONS,
  RegionalApplicationItem,
  RegionalScrutinyStaff,
} from "../data";

interface RegionalDashboardProps {
  onAddAuditEntry: (action: string, target: string, details: string) => void;
}

export const RegionalDashboard: React.FC<RegionalDashboardProps> = ({
  onAddAuditEntry,
}) => {
  const [applications, setApplications] = useState<RegionalApplicationItem[]>(MOCK_REGIONAL_APPLICATIONS);
  const [staff, setStaff] = useState<RegionalScrutinyStaff[]>(MOCK_REGIONAL_STAFF);
  const [selectedOfficerForUnassigned, setSelectedOfficerForUnassigned] = useState<string>("Dr. Sunita Deshmukh");
  const [actionAlert, setActionAlert] = useState<string | null>(null);

  const unassignedCount = applications.filter((a) => !a.assignedTo).length;
  const criticalBreachCount = applications.filter((a) => a.slaBreachRisk === "CRITICAL_BREACH").length;

  const handleAssignApplication = (appId: string) => {
    setApplications((prev) =>
      prev.map((a) =>
        a.applicationId === appId
          ? {
              ...a,
              assignedTo: selectedOfficerForUnassigned,
              stage: "TECHNICAL_SCRUTINY",
              unassignedHours: 0,
              slaBreachRisk: "SAFE",
            }
          : a
      )
    );

    setStaff((prev) =>
      prev.map((s) =>
        s.name === selectedOfficerForUnassigned ? { ...s, activeDockets: s.activeDockets + 1 } : s
      )
    );

    setActionAlert(`Application ${appId} assigned to ${selectedOfficerForUnassigned}. 48h SLA clock paused.`);
    onAddAuditEntry(
      "ALLOCATED_TO_SCRUTINY",
      appId,
      `Dr. R. K. Singhania allocated ${appId} to ${selectedOfficerForUnassigned}.`
    );
    setTimeout(() => setActionAlert(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Regional Officer Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 pt-7 sm:pt-9 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-0.5 rounded-full dark:bg-purple-950/80 dark:border-purple-800 dark:text-purple-300">
              Regional Command Desk
            </span>
            <span className="text-xs text-slate-500 font-semibold dark:text-slate-400">
              Jurisdiction: {MOCK_REGIONAL_OFFICER.region}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {MOCK_REGIONAL_OFFICER.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {MOCK_REGIONAL_OFFICER.designation} • Location: {MOCK_REGIONAL_OFFICER.officeLocation}
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {MOCK_REGIONAL_OFFICER.statesCovered.map((s) => (
              <span key={s} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-center min-w-20">
            <div className="font-bold text-lg text-slate-800 dark:text-slate-200 tabular-nums">{applications.length}</div>
            <div className="text-[11px] text-slate-500 font-medium">Dockets</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/40 px-4 py-2.5 rounded-xl border border-amber-200/80 dark:border-amber-800 text-center min-w-20">
            <div className="font-bold text-lg text-amber-700 dark:text-amber-400 tabular-nums">{unassignedCount}</div>
            <div className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">Unassigned</div>
          </div>
          <div className="bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 rounded-xl border border-rose-200/80 dark:border-rose-800 text-center min-w-20">
            <div className="font-bold text-lg text-rose-700 dark:text-rose-400 tabular-nums">{criticalBreachCount}</div>
            <div className="text-[11px] text-rose-800 dark:text-rose-300 font-medium">48h SLA Alert</div>
          </div>
        </div>
      </div>

      {actionAlert && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3.5 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{actionAlert}</span>
          </div>
          <button onClick={() => setActionAlert(null)} className="text-emerald-700 hover:text-emerald-950 dark:text-emerald-300 font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* 48-Hour SLA Breach Radar Card */}
      {applications.some((a) => a.slaBreachRisk === "CRITICAL_BREACH") && (
        <div className="bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
            <span>🚨</span> 48-Hour Allocation Breach Warning
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-400">
            Approval handbook mandates that every newly received application must be allocated to an authorized Scrutiny Officer within 48 statutory hours:
          </p>

          {applications
            .filter((a) => a.slaBreachRisk === "CRITICAL_BREACH")
            .map((app) => (
              <div
                key={app.applicationId}
                className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/60 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                      {app.applicationId}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {app.instituteName}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    State: {app.state} ({app.district}) • Intake Queue Time: <span className="text-rose-600 font-bold tabular-nums">{app.unassignedHours} hours</span> (SLA Threshold 48h)
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <select
                    value={selectedOfficerForUnassigned}
                    onChange={(e) => setSelectedOfficerForUnassigned(e.target.value)}
                    className="text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {staff.map((s) => (
                      <option key={s.officerId} value={s.name}>
                        {s.name} ({s.activeDockets}/{s.capacityLimit} dockets)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignApplication(app.applicationId)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Assign Docket
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* 2-Column Split: Staff Capacity & Regional Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Staff Roster */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Regional Scrutiny Officers
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full dark:bg-slate-800 dark:text-slate-300 tabular-nums">
              {staff.length}
            </span>
          </div>

          <div className="space-y-3">
            {staff.map((officer) => (
              <div
                key={officer.officerId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {officer.name}
                    </h3>
                    <p className="text-xs text-slate-500">{officer.cadre}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      officer.status === "AVAILABLE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800"
                    }`}
                  >
                    {officer.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Workload:</span>
                    <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                      {officer.activeDockets} / {officer.capacityLimit} Dockets
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        officer.activeDockets / officer.capacityLimit > 0.8 ? "bg-amber-500" : "bg-emerald-600"
                      }`}
                      style={{ width: `${(officer.activeDockets / officer.capacityLimit) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <span>On-Time Verification:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {officer.onTimeCompletionRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 2 Columns: Application Queue Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Northern Jurisdiction Applications Queue
              </h2>
              <span className="text-xs font-semibold text-slate-500 tabular-nums">
                {applications.length} Records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <th className="py-3 px-3">Docket ID</th>
                    <th className="py-3 px-3">Institution Name</th>
                    <th className="py-3 px-3">State</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Assigned Officer</th>
                    <th className="py-3 px-3 text-right">SLA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {applications.map((app) => (
                    <tr key={app.applicationId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {app.applicationId}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{app.instituteName}</div>
                        <div className="text-[11px] text-slate-500">{app.type}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{app.state}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {app.stage.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800 dark:text-slate-200">
                        {app.assignedTo ? (
                          <span>{app.assignedTo}</span>
                        ) : (
                          <span className="text-rose-600 font-bold">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {app.slaBreachRisk === "CRITICAL_BREACH" ? (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                            Breach Risk
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
                            On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
