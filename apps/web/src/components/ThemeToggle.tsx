"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme } from "../context/ThemeContext";

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const options: { value: Theme; label: string; icon: string; description: string }[] = [
    { value: "light", label: "Light", icon: "☀️", description: "Crisp statutory daylight" },
    { value: "dark", label: "Dark", icon: "🌙", description: "High contrast dark slate" },
    { value: "system", label: "System", icon: "💻", description: "Follows OS setting" },
  ];

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={dropdownRef}>
      {/* Primary Toggle Button */}
      <button
        type="button"
        onClick={toggleTheme}
        className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
        title={`Current mode: ${theme} (${resolvedTheme}). Click to switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} mode.`}
        aria-label="Toggle light/dark theme"
      >
        <span className="sr-only">Toggle theme</span>
        {resolvedTheme === "dark" ? (
          <svg
            className="w-4 h-4 text-amber-400 transform transition-transform duration-300 rotate-0 hover:rotate-45"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg
            className="w-4 h-4 text-amber-500 transform transition-transform duration-300 rotate-0 hover:rotate-90"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>

      {/* Mini Options Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-1 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Theme settings (Light, Dark, System)"
        aria-label="Theme options"
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Interface Appearance
          </div>
          <div className="p-1 space-y-0.5">
            {options.map((opt) => {
              const isSelected = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setTheme(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-left ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{opt.icon}</span>
                    <div>
                      <div className="leading-tight">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal leading-tight">
                        {opt.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
