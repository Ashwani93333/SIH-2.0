/**
 * Synthetic Dummy Data: Bureau Officer & Competent Authority Platform
 * Platform: Bureau Leadership & Member Secretary (e.g. Shri Vikram Malhotra & Dr. Rajendra Joshi)
 * System: SETU / AICTE FlowGuard Prototype
 */

export interface BureauLeadershipProfile {
  bureauOfficerName: string;
  bureauOfficerTitle: string;
  memberSecretaryName: string;
  memberSecretaryTitle: string;
  regulatoryYear: string;
}

export interface NationalBottleneckMetric {
  stageName: string;
  stageCode: "INTAKE" | "TECHNICAL_SCRUTINY" | "EVC_VISIT" | "COMMITTEE" | "FINAL_DECISION";
  currentActiveDockets: number;
  averageTurnaroundDays: number;
  slaTargetDays: number;
  slaComplianceRate: number; // percentage
  status: "OPTIMAL" | "AT_RISK" | "BOTTLENECK_DETECTED";
  recommendedAction: string;
}

export interface ImpactRadarMetric {
  applicationId: string;
  instituteName: string;
  region: string;
  programType: string;
  intakeCapacityImpact: {
    existingSeats: number;
    proposedSeats: number;
    netChange: number;
    emergingTechSharePercent: number;
  };
  economicInvestmentInrCrores: number;
  facultyEmploymentGenerated: number;
  litigationRiskScore: number; // 0 to 100
  litigationRiskRationale: string;
  predictedCourtEnforceabilityPercent: number;
}

export interface StatutorySignOffDocket {
  applicationId: string;
  instituteName: string;
  region: string;
  decisionType: "GRANT_OF_APPROVAL" | "REJECTION_ORDER" | "REMAINDER_NOTICE";
  effectiveAcademicYears: string;
  approvedIntake: number;
  scrutinyVerdict: string;
  evcVerdict: string;
  committeeVerdict?: string;
  authorizedSignatory: string;
  digitalSignatureHash?: string;
  signedTimestamp?: string;
  isSigned: boolean;
}

export const MOCK_BUREAU_LEADERSHIP: BureauLeadershipProfile = {
  bureauOfficerName: "Shri Vikram Malhotra",
  bureauOfficerTitle: "Head of Approvals Bureau, AICTE HQ",
  memberSecretaryName: "Dr. Rajendra Joshi",
  memberSecretaryTitle: "Member Secretary & Competent Authority, AICTE",
  regulatoryYear: "2026-2027",
};

export const MOCK_BOTTLENECK_METRICS: NationalBottleneckMetric[] = [
  {
    stageName: "Stage 1: Application Intake & Fee Clearance",
    stageCode: "INTAKE",
    currentActiveDockets: 2,
    averageTurnaroundDays: 1.8,
    slaTargetDays: 3,
    slaComplianceRate: 98.2,
    status: "OPTIMAL",
    recommendedAction: "System functioning smoothly. Automated bank gateway reconciliation verified.",
  },
  {
    stageName: "Stage 2: Technical Document Scrutiny & Rule Flags",
    stageCode: "TECHNICAL_SCRUTINY",
    currentActiveDockets: 4,
    averageTurnaroundDays: 8.4,
    slaTargetDays: 10,
    slaComplianceRate: 84.6,
    status: "BOTTLENECK_DETECTED",
    recommendedAction: "FSR recalculation and land title verification causing slight queue buildup in Northern & Western regions.",
  },
  {
    stageName: "Stage 3: Expert Visit Committee (EVC) On-Site Inspections",
    stageCode: "EVC_VISIT",
    currentActiveDockets: 2,
    averageTurnaroundDays: 11.2,
    slaTargetDays: 14,
    slaComplianceRate: 92.0,
    status: "OPTIMAL",
    recommendedAction: "Empanelled expert pool actively responding. Conflict-of-interest filters operating without delays.",
  },
  {
    stageName: "Stage 4: Standing Hearing Committee (SHC) & Appellate",
    stageCode: "COMMITTEE",
    currentActiveDockets: 1,
    averageTurnaroundDays: 6.8,
    slaTargetDays: 7,
    slaComplianceRate: 94.1,
    status: "OPTIMAL",
    recommendedAction: "Hybrid video hearings resolving land easement disputes within statutory timeframe.",
  },
  {
    stageName: "Stage 5: Final Statutory Order Sign-Off Gate",
    stageCode: "FINAL_DECISION",
    currentActiveDockets: 1,
    averageTurnaroundDays: 1.2,
    slaTargetDays: 3,
    slaComplianceRate: 99.4,
    status: "OPTIMAL",
    recommendedAction: "Digital PKI e-sign queue processed daily by Member Secretary office.",
  },
];

export const MOCK_IMPACT_RADAR_DATA: Record<string, ImpactRadarMetric> = {
  "AICTE/2026/APP-1042": {
    applicationId: "AICTE/2026/APP-1042",
    instituteName: "Sunrise Institute of Technology",
    region: "Northern",
    programType: "UG Engineering (CSE, AI & Data Science)",
    intakeCapacityImpact: {
      existingSeats: 480,
      proposedSeats: 600,
      netChange: 120,
      emergingTechSharePercent: 65,
    },
    economicInvestmentInrCrores: 4.8,
    facultyEmploymentGenerated: 18,
    litigationRiskScore: 12,
    litigationRiskRationale: "Low litigation risk: Institution resolved initial FSR deficiency within 14-day statutory cure window with valid appointment letters.",
    predictedCourtEnforceabilityPercent: 98.4,
  },
  "AICTE/2026/APP-1038": {
    applicationId: "AICTE/2026/APP-1038",
    instituteName: "Greenfield Institute of Engineering",
    region: "Northern",
    programType: "Greenfield Polytechnic & Degree Institute",
    intakeCapacityImpact: {
      existingSeats: 0,
      proposedSeats: 360,
      netChange: 360,
      emergingTechSharePercent: 40,
    },
    economicInvestmentInrCrores: 16.5,
    facultyEmploymentGenerated: 42,
    litigationRiskScore: 18,
    litigationRiskRationale: "Medium-low: New establishment with 10.2 acres clean title. Final fire safety certificate pending submission.",
    predictedCourtEnforceabilityPercent: 96.1,
  },
  "AICTE/2026/APP-1022": {
    applicationId: "AICTE/2026/APP-1022",
    instituteName: "Rural Engineering College",
    region: "Northern",
    programType: "New Rural Engineering Institute",
    intakeCapacityImpact: {
      existingSeats: 0,
      proposedSeats: 300,
      netChange: 0,
      emergingTechSharePercent: 0,
    },
    economicInvestmentInrCrores: 2.1,
    facultyEmploymentGenerated: 0,
    litigationRiskScore: 84,
    litigationRiskRationale: "High litigation probability if rejected without exhaustive hearing record. Transparent Hearing Committee transcript and legal citation insulates AICTE order in High Court.",
    predictedCourtEnforceabilityPercent: 99.1,
  },
};

export const MOCK_STATUTORY_ORDERS: StatutorySignOffDocket[] = [
  {
    applicationId: "AICTE/2026/APP-1018",
    instituteName: "Metropolitan Skill Institute",
    region: "Northern",
    decisionType: "GRANT_OF_APPROVAL",
    effectiveAcademicYears: "2026-2027 to 2028-2029 (3 Years)",
    approvedIntake: 540,
    scrutinyVerdict: "All mandatory norms verified & passed without deficiencies.",
    evcVerdict: "Satisfactory: Bio-metric verification matched 100% roster.",
    authorizedSignatory: "Dr. Rajendra Joshi, Member Secretary",
    digitalSignatureHash: "SHA256:8f2a4b9c1d0e3f5a7c9b2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a",
    signedTimestamp: "2026-03-12T14:32:00Z",
    isSigned: true,
  },
  {
    applicationId: "AICTE/2026/APP-1042",
    instituteName: "Sunrise Institute of Technology",
    region: "Northern",
    decisionType: "GRANT_OF_APPROVAL",
    effectiveAcademicYears: "2026-2027",
    approvedIntake: 600,
    scrutinyVerdict: "FSR deficit rectified with 6 new appointments.",
    evcVerdict: "EVC inspection scheduled for 18-March-2026.",
    authorizedSignatory: "Dr. Rajendra Joshi, Member Secretary",
    isSigned: false,
  },
];
