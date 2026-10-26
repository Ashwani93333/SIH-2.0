"use client";

import React, { useState } from "react";
import {
  MOCK_BUREAU_LEADERSHIP,
  MOCK_BOTTLENECK_METRICS,
  MOCK_IMPACT_RADAR_DATA,
  MOCK_STATUTORY_ORDERS,
  StatutorySignOffDocket,
} from "../data";

interface BureauDashboardProps {
  onAddAuditEntry: (action: string, target: string, details: string) => void;
  isCompetentAuthority?: boolean;
}

export const BureauDashboard: React.FC<BureauDashboardProps> = ({
  onAddAuditEntry,
  isCompetentAuthority = false,
}) => {
  const [orders, setOrders] = useState<StatutorySignOffDocket[]>(MOCK_STATUTORY_ORDERS);
  const [selectedAppForImpact, setSelectedAppForImpact] = useState<string>("AICTE/2026/APP-1042");
  const [activeTab, setActiveTab] = useState<"bottlenecks" | "impact_radar" | "sign_off">(
    isCompetentAuthority ? "sign_off" : "bottlenecks"
  );
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const activeImpact = MOCK_IMPACT_RADAR_DATA[selectedAppForImpact] || MOCK_IMPACT_RADAR_DATA["AICTE/2026/APP-1042"];

  const handleDigitalSignOrder = (appId: string) => {
    const fakeHash = "SHA256:" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const timestamp = new Date().toISOString();

    setOrders((prev) =>
      prev.map((o) =>
        o.applicationId === appId
          ? {
              ...o,
              isSigned: true,
              digitalSignatureHash: fakeHash,
              signedTimestamp: timestamp,
            }
          : o
      )
    );

    setActionNotice(`Statutory Order for ${appId} digitally signed by Member Secretary. Cryptographic seal issued.`);
    onAddAuditEntry(
      "STATUTORY_ORDER_DIGITALLY_SIGNED",
      appId,
      `Dr. Rajendra Joshi (Member Secretary) signed approval order with seal ${fakeHash.slice(0, 24)}...`
    );
    setTimeout(() => setActionNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Bureau Leadership Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 pt-7 sm:pt-9 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold px-3 py-0.5 rounded-full dark:bg-indigo-950/80 dark:border-indigo-800 dark:text-indigo-300">
              {isCompetentAuthority ? "Council Competent Authority" : "Approvals Bureau Headquarters"}
            </span>
            <span className="text-xs text-slate-500 font-semibold dark:text-slate-400">
              Academic Year {MOCK_BUREAU_LEADERSHIP.regulatoryYear}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {isCompetentAuthority ? MOCK_BUREAU_LEADERSHIP.memberSecretaryName : MOCK_BUREAU_LEADERSHIP.bureauOfficerName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {isCompetentAuthority ? MOCK_BUREAU_LEADERSHIP.memberSecretaryTitle : MOCK_BUREAU_LEADERSHIP.bureauOfficerTitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 text-right">
            <div className="font-bold text-sm text-slate-900 dark:text-slate-100">National AICTE Pipeline</div>
            <div className="text-[11px] text-slate-500">8 Canonical Cases Monitored</div>
          </div>
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

      {/* Navigation Sub-Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex overflow-x-auto no-scrollbar gap-6 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab("bottlenecks")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === "bottlenecks"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          National Bottleneck Analytics
        </button>
        <button
          onClick={() => setActiveTab("impact_radar")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === "impact_radar"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          Downstream Impact Radar
        </button>
        <button
          onClick={() => setActiveTab("sign_off")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === "sign_off"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          Statutory Sign-Off Gate
          {orders.filter((o) => !o.isSigned).length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full dark:bg-amber-900/60 dark:text-amber-300 tabular-nums">
              {orders.filter((o) => !o.isSigned).length} Pending
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: BOTTLENECK METRICS */}
      {activeTab === "bottlenecks" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {MOCK_BOTTLENECK_METRICS.map((metric) => (
              <div
                key={metric.stageCode}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-500 text-[11px] font-semibold">{metric.stageCode}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                      metric.status === "OPTIMAL"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {metric.status}
                  </span>
                </div>
                <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                  {metric.averageTurnaroundDays} <span className="text-xs font-normal text-slate-500">days avg</span>
                </div>
                <div className="text-[11px] text-slate-500 tabular-nums">
                  SLA Target: {metric.slaTargetDays}d • Active: {metric.currentActiveDockets}
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${metric.slaComplianceRate > 90 ? "bg-emerald-500" : "bg-amber-500"}`}
                    style={{ width: `${metric.slaComplianceRate}%` }}
                  />
                </div>
                <div className="text-[11px] font-medium text-slate-500 flex justify-between tabular-nums">
                  <span>Compliance:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{metric.slaComplianceRate}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Stage Turnaround & Diagnostic Insights
            </h3>
            <div className="space-y-3">
              {MOCK_BOTTLENECK_METRICS.map((b) => (
                <div
                  key={b.stageCode}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">{b.stageName}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-0.5">{b.recommendedAction}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0 tabular-nums">
                    {b.averageTurnaroundDays} / {b.slaTargetDays} Days
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IMPACT RADAR */}
      {activeTab === "impact_radar" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <label className="text-xs font-semibold text-slate-500">Target Application:</label>
            <select
              value={selectedAppForImpact}
              onChange={(e) => setSelectedAppForImpact(e.target.value)}
              className="text-xs p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-medium"
            >
              <option value="AICTE/2026/APP-1042">AICTE/2026/APP-1042 (Sunrise Institute)</option>
              <option value="AICTE/2026/APP-1038">AICTE/2026/APP-1038 (Greenfield Institute)</option>
              <option value="AICTE/2026/APP-1022">AICTE/2026/APP-1022 (Rural Engineering)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Seat Capacity Growth</div>
              <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
                +{activeImpact.intakeCapacityImpact.netChange}{" "}
                <span className="text-xs text-slate-500 font-normal">seats</span>
              </div>
              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                {activeImpact.intakeCapacityImpact.emergingTechSharePercent}% in Emerging Tech (AI, Robotics, VLSI)
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Capital Infrastructure</div>
              <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                ₹{activeImpact.economicInvestmentInrCrores}{" "}
                <span className="text-xs text-slate-500 font-normal">Crores</span>
              </div>
              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                Invested in laboratories, computing clusters, and campus facilities
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Faculty Employment</div>
              <div className="text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400 tabular-nums">
                +{activeImpact.facultyEmploymentGenerated}{" "}
                <span className="text-xs text-slate-500 font-normal">positions</span>
              </div>
              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                Full-time faculty appointments complying with 1:2:6 cadre proportion
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-1">
              <div className="text-xs text-slate-500 font-semibold">Court Litigation Risk</div>
              <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400 tabular-nums">
                {activeImpact.litigationRiskScore}{" "}
                <span className="text-xs text-slate-500 font-normal">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                {activeImpact.predictedCourtEnforceabilityPercent}% High Court Enforceability Index
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-2">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Procedural Fairness & Litigation Shield Analysis
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {activeImpact.litigationRiskRationale}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: STATUTORY SIGN-OFF GATE */}
      {activeTab === "sign_off" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Council Member Secretary Approval Order Gate
              </h3>
              <p className="text-xs text-slate-500">
                Official statutory orders digitally authenticated with cryptographic SHA-256 seal.
              </p>
            </div>

            <div className="space-y-4">
              {orders.map((ord) => (
                <div
                  key={ord.applicationId}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-800/30"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                          {ord.applicationId}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          • {ord.decisionType.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {ord.instituteName}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Validity: {ord.effectiveAcademicYears} • Sanctioned Intake: <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">{ord.approvedIntake}</span> seats
                      </p>
                    </div>

                    <div>
                      {ord.isSigned ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full dark:bg-emerald-950/70 dark:border-emerald-800 dark:text-emerald-300">
                          ✓ Digitally Authenticated & Sealed
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full dark:bg-amber-950/70 dark:border-amber-800 dark:text-amber-300">
                          Pending Member Secretary Authorization
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-slate-500">Technical Scrutiny Finding:</span>
                      <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{ord.scrutinyVerdict}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">EVC On-Site Finding:</span>
                      <div className="font-medium text-slate-800 dark:text-slate-200 mt-0.5">{ord.evcVerdict}</div>
                    </div>
                  </div>

                  {ord.isSigned ? (
                    <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 p-3.5 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between items-center text-emerald-900 dark:text-emerald-200 font-semibold">
                        <span>Digital Certificate Seal:</span>
                        <span className="text-[11px] font-mono text-slate-500 tabular-nums">{ord.signedTimestamp}</span>
                      </div>
                      <div className="font-mono text-[11px] text-emerald-800 dark:text-emerald-300 break-all tabular-nums">
                        {ord.digitalSignatureHash}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleDigitalSignOrder(ord.applicationId)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        Authorize & Apply Digital Seal
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
