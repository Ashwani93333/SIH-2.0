/**
 * Central Export & Unified State Store for Synthetic Dummy Data
 * All Platforms: Institution, Scrutiny, Regional, EVC, Committee, Bureau, Admin
 * System: SETU / AICTE FlowGuard Prototype
 */

export * from "./institution/mockData";
export * from "./scrutiny/mockData";
export * from "./regional/mockData";
export * from "./evc/mockData";
export * from "./committee/mockData";
export * from "./bureau/mockData";
export * from "./admin/mockData";

export type FlowGuardRole =
  | "INSTITUTION"
  | "SCRUTINY_OFFICER"
  | "REGIONAL_OFFICER"
  | "EVC_COORDINATOR"
  | "COMMITTEE_MEMBER"
  | "BUREAU_OFFICER"
  | "COMPETENT_AUTHORITY"
  | "SYSTEM_ADMIN";

export interface RoleDescriptor {
  role: FlowGuardRole;
  label: string;
  userName: string;
  organization: string;
  badgeColor: string;
  accessibleViews: string[];
}

export const ROLE_DEFINITIONS: Record<FlowGuardRole, RoleDescriptor> = {
  INSTITUTION: {
    role: "INSTITUTION",
    label: "Institution Applicant",
    userName: "Principal, Delhi Institute of Engg.",
    organization: "INST-DELHI-001 (DIET)",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    accessibleViews: ["my_applications", "upload_documents", "compliance_self_check", "deficiencies_inbox"],
  },
  SCRUTINY_OFFICER: {
    role: "SCRUTINY_OFFICER",
    label: "Technical Scrutiny Officer",
    userName: "Dr. A. K. Sharma",
    organization: "Northern Regional Directorate",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    accessibleViews: ["scrutiny_desk", "rule_verification", "deficiency_issuer", "evc_recommender"],
  },
  REGIONAL_OFFICER: {
    role: "REGIONAL_OFFICER",
    label: "Regional Officer",
    userName: "Dr. R. K. Singhania",
    organization: "Northern Regional Office (NRO)",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    accessibleViews: ["regional_command", "workload_allocation", "sla_breach_monitor", "regional_roster"],
  },
  EVC_COORDINATOR: {
    role: "EVC_COORDINATOR",
    label: "EVC Operations Coordinator",
    userName: "Prof. Ramesh Rao",
    organization: "Empanelment & Inspection Cell, HQ",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    accessibleViews: ["evc_operations", "expert_pool", "schedule_inspection", "evc_reports"],
  },
  COMMITTEE_MEMBER: {
    role: "COMMITTEE_MEMBER",
    label: "Standing Hearing Committee Chair",
    userName: "Prof. K. K. Aggarwal",
    organization: "Standing Hearing Committee (Central Bench)",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
    accessibleViews: ["hearing_docket", "oral_representations", "legal_advisory", "committee_minutes"],
  },
  BUREAU_OFFICER: {
    role: "BUREAU_OFFICER",
    label: "Head of Approvals Bureau",
    userName: "Shri Vikram Malhotra",
    organization: "Approvals Bureau, AICTE HQ",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    accessibleViews: ["bureau_command", "national_bottlenecks", "impact_radar", "pipeline_analytics"],
  },
  COMPETENT_AUTHORITY: {
    role: "COMPETENT_AUTHORITY",
    label: "Competent Authority (Member Secretary)",
    userName: "Dr. Rajendra Joshi",
    organization: "Council Secretariat, AICTE",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-300",
    accessibleViews: ["sign_off_gate", "statutory_orders", "impact_radar", "digital_signing"],
  },
  SYSTEM_ADMIN: {
    role: "SYSTEM_ADMIN",
    label: "System Administrator",
    userName: "System Lead / Auditor",
    organization: "FlowGuard Platform Core",
    badgeColor: "bg-zinc-100 text-zinc-800 border-zinc-300",
    accessibleViews: ["scenario_lab", "simulation_clock", "audit_ledger", "system_health"],
  },
};
