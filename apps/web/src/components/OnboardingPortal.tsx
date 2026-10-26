"use client";

import React, { useState, useEffect } from "react";
import { FlowGuardRole } from "../data";
import { DEMO_ACCOUNTS, DemoAccount } from "../data/authCredentials";

interface OnboardingPortalProps {
  onLogin: (role: FlowGuardRole, account: DemoAccount) => void;
}

export const OnboardingPortal: React.FC<OnboardingPortalProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<FlowGuardRole>("INSTITUTION");
  const [emailInput, setEmailInput] = useState<string>("principal@diet-delhi.edu.in");
  const [passwordInput, setPasswordInput] = useState<string>("College@2026#AICTE");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [captchaInput, setCaptchaInput] = useState<string>("");
  const [captchaCode, setCaptchaCode] = useState<string>("648VXC");
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState<boolean>(false);
  const [showImportantNote, setShowImportantNote] = useState<boolean>(false);
  const [showHelpline, setShowHelpline] = useState<boolean>(false);
  const [fontSizeOffset, setFontSizeOffset] = useState<number>(0); // -1, 0, +1

  const activeAccount = DEMO_ACCOUNTS.find((a) => a.role === selectedRole) || DEMO_ACCOUNTS[0];

  // Generate random 6-character alphanumeric CAPTCHA
  const generateCaptcha = () => {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    setCaptchaInput("");
    setCaptchaError(null);
  };

  useEffect(() => {
    generateCaptcha();
  }, [selectedRole]);

  const handleSelectRole = (account: DemoAccount) => {
    setSelectedRole(account.role);
    setEmailInput(account.email);
    setPasswordInput(account.tempPassword);
    setCaptchaError(null);
    setShowLoginDropdown(false);
  };

  const handleAutoFill = () => {
    setEmailInput(activeAccount.email);
    setPasswordInput(activeAccount.tempPassword);
    setCaptchaInput(captchaCode);
    setCaptchaError(null);
  };

  const handleAudioCaptcha = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(captchaCode.split("").join(" "));
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      alert(`Captcha audio code: ${captchaCode.split("").join(" - ")}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify captcha (case-insensitive check)
    if (captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setCaptchaError("Invalid CAPTCHA security code. Please check characters carefully.");
      return;
    }

    setCaptchaError(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin(selectedRole, activeAccount);
    }, 550);
  };

  // Additional cross-body and auxiliary cards matching Screenshot 3
  const AUXILIARY_CATEGORIES = [
    {
      id: "AUX-NBA",
      title: "NBA / NAAC Accreditation",
      subtitle: "Accreditation Validation & NIRF",
      icon: "🎖️",
      role: "REGIONAL_OFFICER" as FlowGuardRole,
      accountRef: DEMO_ACCOUNTS[2], // Scrutiny / Regional
    },
    {
      id: "AUX-UNIV",
      title: "University / TPO Cell",
      subtitle: "State Affiliation & Placement",
      icon: "🏛️",
      role: "COMMITTEE_MEMBER" as FlowGuardRole,
      accountRef: DEMO_ACCOUNTS[4], // Hearing / University
    },
    {
      id: "AUX-DIGI",
      title: "DigiLocker Verification",
      subtitle: "Academic & Land Record Desk",
      icon: "📂",
      role: "SCRUTINY_OFFICER" as FlowGuardRole,
      accountRef: DEMO_ACCOUNTS[2], // Scrutiny
    },
    {
      id: "AUX-NSWS",
      title: "NSWS Single Window",
      subtitle: "National Single Window Portal",
      icon: "🌐",
      role: "BUREAU_OFFICER" as FlowGuardRole,
      accountRef: DEMO_ACCOUNTS[5], // Bureau HQ
    },
  ];

  return (
    <div
      className={`min-h-screen bg-[#f4f7fb] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-all duration-200 ${
        fontSizeOffset === 1 ? "text-base" : fontSizeOffset === -1 ? "text-xs" : "text-sm"
      }`}
    >
      {/* ========================================================================= */}
      {/* 1. TOP STATUTORY GOVT BAR (GIGW 3.0 / UX4G STANDARD) */}
      {/* ========================================================================= */}
      <div className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[11px] py-1 px-4 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Indian Tricolor & Ministry */}
          <div className="flex items-center gap-2 font-medium">
            <span className="inline-flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
              <span className="w-4 h-2.5 rounded-xs inline-flex flex-col overflow-hidden border border-slate-400">
                <span className="h-1/3 bg-[#FF9933]"></span>
                <span className="h-1/3 bg-white flex items-center justify-center">
                  <span className="w-0.5 h-0.5 rounded-full bg-[#000080]"></span>
                </span>
                <span className="h-1/3 bg-[#138808]"></span>
              </span>
              <span>भारत सरकार · Government of India</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="hidden sm:inline text-slate-600 dark:text-slate-400">
              शिक्षा मंत्रालय · Ministry of Education
            </span>
          </div>

          {/* Right: Accessibility, Support, Important Note & Language */}
          <div className="flex items-center gap-2 sm:gap-3 text-slate-600 dark:text-slate-400 font-semibold">
            {/* Important Note Button */}
            <button
              onClick={() => setShowImportantNote(true)}
              className="flex items-center gap-1 text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
            >
              <span>⚠️</span>
              <span>Important Note</span>
            </button>

            <span>•</span>

            {/* Helpline & Support */}
            <button
              onClick={() => setShowHelpline(true)}
              className="flex items-center gap-1 text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <span>📞</span>
              <span className="hidden sm:inline">Helpline & Support</span>
            </button>

            <span>•</span>

            {/* Language Selector */}
            <div className="flex items-center gap-1">
              <span>🌐</span>
              <span className="font-bold">EN</span>
            </div>

            <span>•</span>

            {/* Text Zoom Accessibility (A- / A / A+) */}
            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
              <button
                onClick={() => setFontSizeOffset(-1)}
                className={`px-1 rounded ${fontSizeOffset === -1 ? "bg-white dark:bg-slate-700 font-bold" : ""}`}
                title="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={() => setFontSizeOffset(0)}
                className={`px-1 rounded ${fontSizeOffset === 0 ? "bg-white dark:bg-slate-700 font-bold" : ""}`}
                title="Normal font size"
              >
                A
              </button>
              <button
                onClick={() => setFontSizeOffset(1)}
                className={`px-1 rounded ${fontSizeOffset === 1 ? "bg-white dark:bg-slate-700 font-bold" : ""}`}
                title="Increase font size"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OFFICIAL AICTE PORTAL HEADER (MATCHING SCREENSHOT 1 & 2) */}
      {/* ========================================================================= */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* Logo & Council Emblem Badge */}
          <div className="flex items-center gap-3">
            {/* Stylized Emblem / Portal Seal (Safe Hackathon Prototype Styling) */}
            <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-amber-600 via-orange-500 to-amber-700 flex items-center justify-center text-white font-extrabold text-2xl shadow-md border-2 border-white dark:border-slate-800">
              🏛️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100">
                  AICTE <span className="text-amber-600 dark:text-amber-500">ACAS</span>
                </span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  SIH-2026 Prototype
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                अखिल भारतीय तकनीकी शिक्षा परिषद • Compliance & Approval Support System
              </p>
            </div>
          </div>

          {/* Navigation Links & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Center Dropdown Menus */}
            <nav className="hidden md:flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1 hover:text-amber-600 cursor-pointer">
                <span>Explore</span>
                <span className="text-[10px]">⌄</span>
              </div>
              <div className="flex items-center gap-1 hover:text-amber-600 cursor-pointer">
                <span>Approval Handbook 2026-27</span>
                <span className="text-[10px]">⌄</span>
              </div>
              <div className="flex items-center gap-1 hover:text-amber-600 cursor-pointer">
                <span>Govt Portals</span>
                <span className="text-[10px]">⌄</span>
              </div>
            </nav>

            {/* Direct Login Dropdown Menu matching Screenshot 1 */}
            <div className="relative">
              <button
                onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-amber-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <span>➔]</span>
                <span>Login</span>
                <span className="text-[10px]">⌄</span>
              </button>

              {/* Dropdown Menu Popup matching Screenshot 1 */}
              {showLoginDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Select Authorized Workspace
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {DEMO_ACCOUNTS.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => handleSelectRole(acc)}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between gap-2 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer ${
                          selectedRole === acc.role
                            ? "bg-amber-50 dark:bg-amber-950/60 font-bold text-amber-700 dark:text-amber-300"
                            : "text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{acc.avatarIcon}</span>
                          <span className="truncate">{acc.badgeText}</span>
                        </div>
                        {selectedRole === acc.role && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50">
                    <button
                      onClick={() => {
                        setShowLoginDropdown(false);
                        const el = document.getElementById("login-categories");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full text-center text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    >
                      View All 8 Login Categories ➔
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Direct Quick College Access Button (Primary Green Pill matching Screenshot 1) */}
            <button
              onClick={() => handleSelectRole(DEMO_ACCOUNTS[0])}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>🎓</span>
              <span>Register / College</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. SUB-TICKER / MARQUEE (MATCHING SCREENSHOT 1 & 2) */}
      {/* ========================================================================= */}
      <div className="bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200/80 dark:border-amber-800/60 py-1.5 px-4 overflow-hidden text-xs text-amber-900 dark:text-amber-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-medium text-[11px]">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span className="font-extrabold text-red-600 uppercase tracking-wide">● LIVE</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto no-scrollbar whitespace-nowrap text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-semibold cursor-pointer">
              <span>📋</span>
              <span>Extension of Approval (EoA) AY 2026-27 Window Open</span>
              <span className="text-amber-600">↗</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 hover:underline cursor-pointer">
              <span>⚖️</span>
              <span>Approval Process Handbook (APH 2026-27) Gazette Notification</span>
              <span>↗</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 hover:underline cursor-pointer">
              <span>🌐</span>
              <span>National Single Window System (NSWS) Live Integration</span>
              <span>↗</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 hover:underline cursor-pointer">
              <span>🎖️</span>
              <span>NBA / NAAC & NIRF Cross-Verification Synchronized</span>
              <span>↗</span>
            </span>
          </div>

          <span className="hidden lg:inline text-slate-400 text-[10px]">
            Statutory AICTE Act 1987 Compliance
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MAIN BODY CONTAINER */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-10">
        {/* Portal Hero Banner matching Screenshot 3 */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold tracking-wide">
            <span>🛡️</span>
            <span>OFFICIAL AICTE & MOE NATIONAL PORTAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            AICTE Compliance & Approval Support System (ACAS)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            Select your portal category at the top to access your authorized workspace below.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: SELECT LOGIN CATEGORY (MATCHING SCREENSHOT 3) */}
        {/* ========================================================================= */}
        <div id="login-categories" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                1
              </span>
              <span>SELECT LOGIN CATEGORY</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Click to select authority workspace
            </span>
          </div>

          {/* Cards Grid matching Screenshot 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {DEMO_ACCOUNTS.map((acc) => {
              const isSelected = selectedRole === acc.role;
              return (
                <div
                  key={acc.id}
                  onClick={() => handleSelectRole(acc)}
                  className={`rounded-2xl p-4 transition-all duration-200 cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-50/40 dark:bg-amber-950/30 border-2 border-amber-500 ring-2 ring-amber-400/40 shadow-md"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                  }`}
                >
                  {/* Selected Green Checkmark Pill matching Screenshot 3 */}
                  {isSelected && (
                    <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      ✓
                    </div>
                  )}

                  <div className="space-y-3">
                    {/* Icon Square matching Screenshot 3 */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-transform ${
                        isSelected
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {acc.avatarIcon}
                    </div>

                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                        {acc.badgeText}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5 line-clamp-1">
                        {acc.designation.split("/")[0]}
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {acc.description}
                    </p>
                  </div>

                  {/* Demo Credential Snippet */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 mt-3 text-[10px] font-mono text-slate-400 truncate">
                    ID: {acc.email.split("@")[0]}
                  </div>
                </div>
              );
            })}

            {/* Auxiliary Government Cross-Verification Desks matching references */}
            {AUXILIARY_CATEGORIES.map((aux) => {
              const isSelected = selectedRole === aux.role && activeAccount.badgeText === aux.title;
              return (
                <div
                  key={aux.id}
                  onClick={() => handleSelectRole(aux.accountRef)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl border border-slate-200 dark:border-slate-700">
                      {aux.icon}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                        {aux.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium pt-0.5">
                        {aux.subtitle}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      Cross-record data verification and accreditation sync under statutory APH guidelines.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3 text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                    Connected Gateway ➔
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 2: ENTER CREDENTIALS (MATCHING SCREENSHOT 1 & 2) */}
        {/* ========================================================================= */}
        <div className="space-y-4 pt-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
              2
            </span>
            <span>ENTER CREDENTIALS ({activeAccount.badgeText.toUpperCase()})</span>
          </h2>

          {/* 2-Column Split matching Screenshot 1 & 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: OFFICIAL LOGIN FORM */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Vibrant Orange Workspace Banner matching Screenshot 1 */}
              <div className="bg-linear-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-2xl p-4 sm:p-5 flex items-center gap-3.5 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shrink-0">
                  {activeAccount.avatarIcon}
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-100">
                    ACTIVE PORTAL WORKSPACE
                  </div>
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                    {activeAccount.badgeText} ({activeAccount.name.split(" ")[0]})
                  </h3>
                </div>
              </div>

              {/* Form Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Email Address / Portal ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    EMAIL ADDRESS / REGISTERED PORTAL ID*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400">✉</span>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      required
                      placeholder="e.g. principal@diet-delhi.edu.in"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* 2. Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      PASSWORD*
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Password recovery instructions dispatched to the registered head of institute / officer email.")}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-400">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      required
                      placeholder="Enter statutory password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer text-sm"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* 3. SECURITY CHECK (CAPTCHA) matching Screenshot 1 & 2 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      SECURITY CHECK (CAPTCHA)*
                    </label>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span>🛡️</span>
                      <span>BOT PROTECTION</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    {/* Wavy Distorted Visual Captcha Box matching Screenshot 1 */}
                    <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-linear-to-r from-slate-100 via-amber-50 to-slate-100 dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-800 p-2.5 flex items-center justify-between select-none overflow-hidden">
                      {/* Distorted SVG graphic background simulating security noise */}
                      <svg
                        className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M0,15 Q40,5 80,18 T160,10 T240,25" fill="none" stroke="#2563eb" strokeWidth="1.5" />
                        <path d="M0,25 Q50,35 100,12 T200,28 T300,15" fill="none" stroke="#ea580c" strokeWidth="1.5" />
                        <path d="M10,5 Q60,30 110,10 T210,20 T310,8" fill="none" stroke="#16a34a" strokeWidth="1.5" />
                      </svg>

                      {/* Captcha text with random rotation & letter spacing */}
                      <div className="font-mono font-extrabold text-xl tracking-[0.25em] text-slate-800 dark:text-slate-100 relative z-10 pl-2 italic">
                        {captchaCode}
                      </div>

                      {/* Refresh & Audio buttons */}
                      <div className="flex items-center gap-1 relative z-10">
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 shadow-2xs flex items-center justify-center text-xs font-bold cursor-pointer"
                          title="Generate new CAPTCHA"
                        >
                          🔄
                        </button>
                        <button
                          type="button"
                          onClick={handleAudioCaptcha}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-600 shadow-2xs flex items-center justify-center text-xs font-bold cursor-pointer"
                          title="Play audio CAPTCHA"
                        >
                          🔊
                        </button>
                      </div>
                    </div>

                    {/* Captcha Code Input Box */}
                    <div>
                      <input
                        type="text"
                        maxLength={6}
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                        required
                        placeholder="ENTER THE CODE"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-mono tracking-widest text-center uppercase focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {captchaError && (
                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400 pt-1">
                      ⚠️ {captchaError}
                    </p>
                  )}
                </div>

                {/* Quick Auto-Fill Helper for Hackathon Evaluators */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>⚡</span>
                    <span>Auto-Fill Verified Demo Credentials</span>
                  </button>
                  <span className="text-[11px] text-slate-400">
                    PIN: {activeAccount.securityPin}
                  </span>
                </div>

                {/* Big Green Submit Button matching Screenshot 1 & 2 */}
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm tracking-wider uppercase shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                >
                  {isAuthenticating ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>AUTHENTICATING WITH AICTE GATEWAY...</span>
                    </span>
                  ) : (
                    <>
                      <span>LOGIN TO DASHBOARD</span>
                      <span>➔</span>
                    </>
                  )}
                </button>

                <div className="text-center text-xs text-slate-500 pt-2">
                  <span>Haven't confirmed your portal credentials? </span>
                  <button
                    type="button"
                    onClick={() => alert("Verification link dispatched to institutional head.")}
                    className="text-blue-600 dark:text-blue-400 underline font-semibold cursor-pointer"
                  >
                    Verify Email
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT COLUMN: VERIFIED WORKSPACE DETAILS (MATCHING SCREENSHOT 1 & 2) */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
              {/* Photo Banner with Badges matching Screenshot 1 & 2 */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-16/9 flex items-end p-4 border border-slate-200 dark:border-slate-800">
                {/* Background visual texture */}
                <div className="absolute inset-0 bg-linear-to-tr from-slate-950 via-slate-900 to-indigo-950 opacity-90"></div>
                <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

                {/* Watermark / Badge Overlay */}
                <div className="relative z-10 flex flex-wrap gap-2">
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <span>✓</span>
                    <span>OFFICIAL PORTAL</span>
                  </span>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                    VERIFIED DESK
                  </span>
                </div>
              </div>

              {/* Title & Portal Description */}
              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                  {activeAccount.portalTitle}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                  {activeAccount.description}
                </p>
              </div>

              {/* Key Category Features & Benefits matching Screenshot 1 & 2 */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  KEY CATEGORY FEATURES & BENEFITS:
                </div>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {activeAccount.capabilities.map((cap, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                        ✓
                      </span>
                      <span className="leading-tight">{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Active Officer Identity Card */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/80 text-xs space-y-1">
                <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <span>{activeAccount.avatarIcon}</span>
                  <span>{activeAccount.name}</span>
                </div>
                <div className="text-[11px] text-amber-900 dark:text-amber-300 font-semibold">
                  {activeAccount.designation}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {activeAccount.organization}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 5. GIGW 3.0 FOOTER */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            All India Council for Technical Education (AICTE) • Ministry of Education, Government of India
          </p>
          <p className="text-[11px] text-slate-500 max-w-2xl mx-auto">
            Smart India Hackathon 2026 Prototype · Compliance & Approval Support System (ACAS) · UX4G & GIGW 3.0 Standard
          </p>
        </div>
      </footer>

      {/* Floating Helpline Widget Button matching Screenshot 1 & 2 */}
      <button
        onClick={() => setShowHelpline(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-xl flex items-center justify-center text-xl cursor-pointer transform hover:scale-110 transition-transform z-40 border-2 border-white"
        title="AICTE Helpline & Support"
      >
        📞
      </button>

      {/* Important Note Modal Popup */}
      {showImportantNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>⚠️</span>
                <span>Statutory Important Note</span>
              </h3>
              <button
                onClick={() => setShowImportantNote(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>
                <strong>Approval Process Handbook (APH 2026-27):</strong> All Technical Institutions seeking Extension of Approval (EoA), Increase in Intake, or New Courses must submit mandatory statutory instruments before the designated statutory deadline.
              </p>
              <p>
                All data submitted through ACAS is subject to 3-tier validation (Document AI OCR, National Faculty Cross-Verification, and on-site EVC geotagged inspection).
              </p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowImportantNote(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helpline & Support Modal Popup */}
      {showHelpline && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>📞</span>
                <span>AICTE ACAS Helpdesk & Support</span>
              </h3>
              <button
                onClick={() => setShowHelpline(false)}
                className="text-slate-400 hover:text-slate-700 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">National Helpline (Toll-Free):</div>
                <div className="font-mono text-sm text-amber-600 font-bold">1800-11-22-33 / 011-29581000</div>
                <div className="text-[11px] text-slate-500">Available Monday to Saturday (9:30 AM – 5:30 PM)</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200">Technical Support Desk:</div>
                <div className="font-mono text-xs text-blue-600">helpdesk-approval@aicte-india.org</div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHelpline(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
