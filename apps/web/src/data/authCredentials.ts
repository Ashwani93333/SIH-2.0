/**
 * Synthetic Demo Credentials & Role Definitions for AICTE Compliance & Approval Support System (ACAS)
 * Smart India Hackathon 2026 · Reference: aicte.gov.in / UX4G / GIGW 3.0
 */

import { FlowGuardRole } from "./index";

export interface DemoAccount {
  id: string;
  role: FlowGuardRole;
  categoryCode: string;
  name: string;
  designation: string;
  organization: string;
  email: string;
  tempPassword: string;
  securityPin: string;
  avatarIcon: string;
  badgeText: string;
  badgeColor: string;
  portalTitle: string;
  description: string;
  capabilities: string[];
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "ACC-INST-01",
    role: "INSTITUTION",
    categoryCode: "COLLEGE",
    name: "Dr. Sandeep Mukherjee",
    designation: "Principal / Head of Institution",
    organization: "Delhi Institute of Engineering & Technology (AICTE-ND-1049)",
    email: "principal@diet-delhi.edu.in",
    tempPassword: "College@2026#AICTE",
    securityPin: "2026",
    avatarIcon: "🎓",
    badgeText: "College Applicant",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    portalTitle: "AICTE Verified College / Institute Portal",
    description: "Submit new courses, intake expansion, mandatory statutory documents (Land, Fire NOC, Faculty Cadre), and track EoA progression.",
    capabilities: [
      "AICTE Web Portal Tabbed Flow: Trust, Land, Facilities, Faculty & Fee",
      "Interactive APH 2026-27 Rulebook Live FSR & Infrastructure Validator",
      "Mandatory Statutory File Uploading with OCR Verification",
      "Download Official Extension of Approval (EoA) Letters & Orders",
    ],
  },
  {
    id: "ACC-EVC-01",
    role: "EVC_COORDINATOR",
    categoryCode: "EVC",
    name: "Prof. Ramesh Rao",
    designation: "EVC Operations Coordinator",
    organization: "Empanelment & Inspection Cell, AICTE New Delhi",
    email: "evc.coord@aicte-india.org",
    tempPassword: "Inspector@2026#EVC",
    securityPin: "2026",
    avatarIcon: "📋",
    badgeText: "EVC Operations",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    portalTitle: "AICTE Expert Visit Committee (EVC) Portal",
    description: "Coordinate on-site physical inspection panels, verify laboratories and barrier-free infrastructure, and submit geotagged inspection reports.",
    capabilities: [
      "Assign unbiased 3-member expert inspection panels with conflict checks",
      "Review live GPS & timestamped geotagged video/photo evidence",
      "Standardized EVC inspection checklist submission under APH 2026-27",
      "Instant flagging of infrastructural deficits to Regional Directorate",
    ],
  },
  {
    id: "ACC-SCRUT-01",
    role: "SCRUTINY_OFFICER",
    categoryCode: "SCRUTINY",
    name: "Dr. A. K. Sharma",
    designation: "Technical Scrutiny Officer",
    organization: "Northern Regional Directorate (NRO)",
    email: "ak.sharma@aicte-india.org",
    tempPassword: "Officer@2026#Scrutiny",
    securityPin: "2026",
    avatarIcon: "🔍",
    badgeText: "Scrutiny Desk",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    portalTitle: "AICTE Technical Scrutiny & Document AI Desk",
    description: "Multi-layered rule verification, automated Document AI OCR cross-check, ghost faculty detection, and single-click deficiency notices.",
    capabilities: [
      "Automated cross-examination of declared data vs uploaded PDF OCR",
      "Instant deficiency notice generation with statutory clause citations",
      "National faculty database cross-check (duplicate PAN/Aadhaar)",
      "Fast-track clearance recommendation for high-compliance dockets",
    ],
  },
  {
    id: "ACC-REG-01",
    role: "REGIONAL_OFFICER",
    categoryCode: "REGIONAL",
    name: "Dr. R. K. Singhania",
    designation: "Regional Officer & Director",
    organization: "Northern Regional Office (NRO, Kanpur/Delhi)",
    email: "ro.nro@aicte-india.org",
    tempPassword: "Regional@2026#NRO",
    securityPin: "2026",
    avatarIcon: "🏛️",
    badgeText: "Regional Command",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    portalTitle: "AICTE Regional Directorate Command",
    description: "Jurisdictional application throughput management, statutory SLA breach monitoring, and physical inspection authorizations.",
    capabilities: [
      "Real-time regional application velocity & throughput dashboard",
      "Automated statutory SLA breach alerts & officer workload rebalancing",
      "Authorize unannounced physical Expert Visit Committee inspections",
      "State-wise technical education capacity & vacancy analytics",
    ],
  },
  {
    id: "ACC-COMM-01",
    role: "COMMITTEE_MEMBER",
    categoryCode: "HEARING",
    name: "Prof. K. K. Aggarwal",
    designation: "Standing Hearing Committee Chair",
    organization: "Standing Hearing Committee (Central Bench)",
    email: "shc.chair@aicte-india.org",
    tempPassword: "Justice@2026#SHC",
    securityPin: "2026",
    avatarIcon: "⚖️",
    badgeText: "Hearing Bench",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    portalTitle: "Standing Hearing Committee (SHC) Bench",
    description: "Quasi-judicial natural justice hearings, reviewing college oral representations, and deciding statutory appeals against rejections.",
    capabilities: [
      "Review appeal dockets with audio/video oral representation logs",
      "Inspect original registered deeds, certified affidavits & rectifications",
      "Issue binding quasi-judicial minutes and conditional waiver orders",
      "Refer policy ambiguities to Council Secretariat",
    ],
  },
  {
    id: "ACC-BUR-01",
    role: "BUREAU_OFFICER",
    categoryCode: "BUREAU",
    name: "Shri Vikram Malhotra",
    designation: "Head of Approvals Bureau",
    organization: "Approvals Bureau, AICTE New Delhi",
    email: "bureau.hq@aicte-india.org",
    tempPassword: "Bureau@2026#HQ",
    securityPin: "2026",
    avatarIcon: "📊",
    badgeText: "Bureau HQ",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    portalTitle: "AICTE Central Approvals Bureau HQ",
    description: "Pan-India oversight, pipeline bottleneck diagnostics, seat capacity expansion analytics, and executive compliance radar.",
    capabilities: [
      "National approval pipeline velocity & backlog radar",
      "Discipline-wise intake trends (Emerging Areas: AI, VLSI, Robotics)",
      "Cross-region SLA adherence index & statutory compliance reports",
      "Cabinet & Ministry of Education quarterly briefing metrics",
    ],
  },
  {
    id: "ACC-COMP-01",
    role: "COMPETENT_AUTHORITY",
    categoryCode: "SECRETARIAT",
    name: "Dr. Rajendra Joshi",
    designation: "Member Secretary & Competent Authority",
    organization: "Council Secretariat, AICTE New Delhi",
    email: "member.secretary@aicte-gov.in",
    tempPassword: "Authority@2026#Sign",
    securityPin: "2026",
    avatarIcon: "✍️",
    badgeText: "Executive Gate",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    portalTitle: "AICTE Council Secretariat Sign-Off Gate",
    description: "Sole statutory gate with legal authority to issue formal Extension of Approval (EoA) and Letter of Approval (LoA) orders.",
    capabilities: [
      "Sole statutory sign-off gate for official Council Gazette orders",
      "Cryptographic DSC Digital Signature seal on generated EoA letters",
      "Statutory decision audit trail with legal enforceability",
      "Post-approval continuous compliance monitoring activation",
    ],
  },
  {
    id: "ACC-ADMIN-01",
    role: "SYSTEM_ADMIN",
    categoryCode: "ADMIN",
    name: "Regulatory Auditor Lead",
    designation: "Platform Administrator & Auditor",
    organization: "FlowGuard Platform Engineering Core",
    email: "admin@flowguard-core.gov.in",
    tempPassword: "Admin@2026#Ledger",
    securityPin: "2026",
    avatarIcon: "🛡️",
    badgeText: "System Ledger",
    badgeColor: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
    portalTitle: "FlowGuard Cryptographic Audit Ledger & Simulator",
    description: "Immutable SHA-256 cryptographic audit chain verification, statutory timeline simulation (+1 day, +5 days), and scenario lab.",
    capabilities: [
      "Verify unbroken SHA-256 hash chains across all regulatory actions",
      "Statutory calendar progression simulation engine",
      "Benchmark test suite across canonical regulatory dockets",
      "Monitor rules engine versioning and system integrity metrics",
    ],
  },
];

