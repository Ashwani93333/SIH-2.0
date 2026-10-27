"use client";

import React from "react";
import { FlowGuardRole, ROLE_DEFINITIONS } from "../data";
import { ThemeToggle } from "./ThemeToggle";

interface NavbarProps {
  currentRole: FlowGuardRole;
  onSelectRole: (role: FlowGuardRole) => void;
  simulatedDays: number;
  onAdvanceDays: (days: number) => void;
  onResetDemo: () => void;
  onExitToGateway?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onSelectRole,
  simulatedDays,
  onAdvanceDays,
  onResetDemo,
  onExitToGateway,
}) => {
  const activeRoleDef = ROLE_DEFINITIONS[currentRole];

  // Base workflow timeline start: 01-March-2026
  const baseDate = new Date(2026, 2, 1);
  baseDate.setDate(baseDate.getDate() + simulatedDays);
  const formattedDate = baseDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-y-2.5 gap-x-4 py-2.5 min-h-16">
          {/* Logo & Portal Branding */}
          <div
            onClick={onExitToGateway}
            className="flex items-center gap-3 shrink-0 cursor-pointer group"
            title="Click to return to Multi-Role Onboarding Gateway"
          >
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden p-1 shadow-sm shadow-emerald-500/10 group-hover:scale-105 transition-transform">
              <img
                src="/aicte-logo.png"
                alt="AICTE Official Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 leading-none">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
                  AICTE <span className="text-emerald-600 dark:text-emerald-400">FlowGuard</span>
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-1.5 py-0.5 rounded dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300">
                  SETU v3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-1">
                National Technical Approval & Governance Portal
              </p>
            </div>
          </div>

          {/* Right Controls: Timeline Simulator, Theme, Role Selector & User Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Timeline Controls */}
            <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs">
              <div className="flex items-center gap-1.5 px-2 py-0.5 font-medium text-slate-600 dark:text-slate-300">
                <span className="text-slate-400">📅</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums text-xs">
                  {formattedDate}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-1.5 py-0.2 rounded dark:bg-emerald-950/60 dark:text-emerald-300 tabular-nums">
                  Day +{simulatedDays}
                </span>
              </div>
              <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />
              <button
                onClick={() => onAdvanceDays(1)}
                className="px-2 py-1 rounded bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                title="Advance timeline by 1 day"
              >
                +1 Day
              </button>
              <button
                onClick={() => onAdvanceDays(5)}
                className="ml-1 px-2 py-1 rounded bg-white hover:bg-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-[11px] shadow-2xs transition-colors cursor-pointer"
                title="Advance timeline by 5 days (monitors statutory SLA thresholds)"
              >
                +5 Days
              </button>
              <button
                onClick={onResetDemo}
                className="ml-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium text-[11px] transition-colors cursor-pointer"
                title="Reset workflow timeline to current baseline"
              >
                Reset
              </button>
            </div>

            {/* Dark / Light Theme Toggle */}
            <ThemeToggle />

            {/* Log Out / Exit to Onboarding Gateway Button */}
            {onExitToGateway && (
              <button
                onClick={onExitToGateway}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Log out and return to Onboarding Portal"
              >
                <span>🚪</span>
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}

            {/* User Profile Pill */}
            <div className="hidden sm:flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-2xs ring-1 ring-emerald-500/20 shrink-0">
                {activeRoleDef.userName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  {activeRoleDef.userName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight pt-0.5">
                  {activeRoleDef.organization}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
