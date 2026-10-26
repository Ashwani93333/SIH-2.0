/**
 * Synthetic Dummy Data: Expert Visit Committee (EVC) Platform
 * Platform: EVC Coordinators and Empanelled Expert Inspectors (e.g. Prof. Ramesh Rao)
 * System: SETU / AICTE FlowGuard Prototype
 */

export interface EmpanelledExpert {
  id: string;
  name: string;
  institution: string;
  discipline: string;
  experienceYears: number;
  location: string;
  conflictDeclared: boolean;
  status: "AVAILABLE" | "ASSIGNED_ON_VISIT" | "COOLING_PERIOD";
}

export interface EvcInspectionItem {
  id: string;
  applicationId: string;
  instituteName: string;
  instituteAddress: string;
  visitType: "PHYSICAL_ON_SITE" | "HYBRID_REMOTE";
  scheduledDate: string;
  inspectors: string[];
  geoCoordinates?: { lat: number; lng: number };
  inspectionStatus: "SCHEDULED" | "IN_PROGRESS" | "REPORT_SUBMITTED" | "CLOSED";
  verificationFindings?: {
    landBoundariesVerified: boolean;
    laboratoriesEquipped: boolean;
    facultyBiometricMatched: boolean;
    fireExitRampsOperational: boolean;
    libraryVolumeCount: number;
    pcStudentRatioMatched: boolean;
  };
  overallVerdict?: "SATISFACTORY" | "DEFICIENT" | "CONDITIONAL_APPROVAL";
  inspectorSummaryNotes?: string;
  signedReportDoc?: string;
}

export const MOCK_EVC_COORDINATOR = {
  id: "EVC-COORD-01",
  name: "Prof. Ramesh Rao",
  designation: "Chief Coordinator, EVC Operations Directorate",
  headquarters: "AICTE HQ, Nelson Mandela Marg, New Delhi",
  activeVisitsCount: 6,
  poolUtilizationPercent: 78,
};

export const MOCK_EMPANELLED_EXPERTS: EmpanelledExpert[] = [
  {
    id: "EXP-101",
    name: "Dr. K. Radhakrishnan",
    institution: "Indian Institute of Science / Former IIT Professor",
    discipline: "Electronics & Communication / Microwave Engineering",
    experienceYears: 28,
    location: "Bengaluru",
    conflictDeclared: false,
    status: "ASSIGNED_ON_VISIT",
  },
  {
    id: "EXP-102",
    name: "Dr. Anita Roy",
    institution: "Delhi Technological University (DTU)",
    discipline: "Civil Engineering & Structural Safety",
    experienceYears: 22,
    location: "New Delhi",
    conflictDeclared: false,
    status: "AVAILABLE",
  },
  {
    id: "EXP-103",
    name: "Prof. S. N. Varma",
    institution: "Indraprastha Institute of Information Technology (IIIT)",
    discipline: "Computer Science & Machine Learning",
    experienceYears: 19,
    location: "Noida / New Delhi",
    conflictDeclared: false,
    status: "ASSIGNED_ON_VISIT",
  },
  {
    id: "EXP-104",
    name: "Dr. Pradeep Choksi",
    institution: "Veermata Jijabai Technological Institute (VJTI)",
    discipline: "Mechanical & Robotics Automation",
    experienceYears: 24,
    location: "Mumbai",
    conflictDeclared: false,
    status: "AVAILABLE",
  },
  {
    id: "EXP-105",
    name: "Prof. H. K. Narang",
    institution: "National Institute of Technology (NIT) Kurukshetra",
    discipline: "Electrical & Renewable Power Systems",
    experienceYears: 26,
    location: "Haryana",
    conflictDeclared: false,
    status: "COOLING_PERIOD",
  },
];

export const MOCK_EVC_INSPECTIONS: EvcInspectionItem[] = [
  {
    id: "EVC-VISIT-1042",
    applicationId: "AICTE/2026/APP-1042",
    instituteName: "Sunrise Institute of Technology",
    instituteAddress: "Plot 14, Knowledge Park III, Greater Noida, UP",
    visitType: "PHYSICAL_ON_SITE",
    scheduledDate: "2026-03-18",
    inspectors: ["Dr. K. Radhakrishnan", "Prof. S. N. Varma"],
    geoCoordinates: { lat: 28.4744, lng: 77.504 },
    inspectionStatus: "SCHEDULED",
    inspectorSummaryNotes: "Scheduled inspection to verify newly appointed 6 CSE faculty, 120 new high-performance desktop machines, and fire hydrant operational readiness.",
  },
  {
    id: "EVC-VISIT-1018",
    applicationId: "AICTE/2026/APP-1018",
    instituteName: "Metropolitan Skill Institute",
    instituteAddress: "Institutional Area, Lodhi Road, New Delhi",
    visitType: "PHYSICAL_ON_SITE",
    scheduledDate: "2026-03-08",
    inspectors: ["Dr. Anita Roy", "Dr. Pradeep Choksi"],
    geoCoordinates: { lat: 28.5892, lng: 77.2274 },
    inspectionStatus: "REPORT_SUBMITTED",
    verificationFindings: {
      landBoundariesVerified: true,
      laboratoriesEquipped: true,
      facultyBiometricMatched: true,
      fireExitRampsOperational: true,
      libraryVolumeCount: 18450,
      pcStudentRatioMatched: true,
    },
    overallVerdict: "SATISFACTORY",
    inspectorSummaryNotes: "Clean inspection. Robotics and AI lab equipment matches sanctioned curriculum. All faculty authenticated through biometric reader. EVC recommends unconditional grant.",
    signedReportDoc: "EVC_Report_Signed_APP_1018.pdf",
  },
];
