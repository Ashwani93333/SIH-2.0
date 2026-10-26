/**
 * Synthetic Dummy Data: Institution Platform (Applicant Side)
 * Platform: College Administrators, Principals, Registrars
 * System: SETU / AICTE FlowGuard Prototype
 */

export interface InstitutionProfile {
  id: string;
  name: string;
  code: string;
  trustName: string;
  address: string;
  state: string;
  district: string;
  pincode: string;
  region: string;
  contactEmail: string;
  contactPhone: string;
  accreditation: string;
  establishedYear: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: "Land" | "Infrastructure" | "Safety" | "Faculty" | "Affiliation" | "Financial";
  status: "UPLOADED" | "VERIFIED" | "DEFICIENT" | "PENDING";
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  verifiedAt?: string;
  extractedValues?: Record<string, string | number>;
  notes?: string;
}

export interface DeficiencyItem {
  id: string;
  ruleCode: string;
  description: string;
  raisedBy: string;
  raisedAt: string;
  dueAt: string;
  daysRemaining: number;
  status: "OPEN" | "RESPONSE_SUBMITTED" | "CLEARED";
  responseExplanation?: string;
  rectificationDocName?: string;
  clearedAt?: string;
}

export interface ApplicationDraft {
  applicationId: string;
  type: "NEW_INSTITUTE" | "EXTENSION_OF_APPROVAL" | "INCREASE_INTAKE" | "NEW_COURSE";
  program: string;
  targetAcademicYear: string;
  currentStage: "SUBMITTED" | "UNDER_REVIEW" | "COMMITTEE" | "APPROVED" | "REJECTED";
  stepProgress: number; // 1 to 4
  submissionDate: string;
  intakeRequested: number;
  existingIntake: number;
  slaDaysTotal: number;
  slaDaysUsed: number;
  deficiencies: DeficiencyItem[];
  documents: DocumentItem[];
}

export const MOCK_INSTITUTION_PROFILE: InstitutionProfile = {
  id: "INST-DELHI-001",
  name: "Delhi Institute of Engineering & Technology",
  code: "AICTE-ND-1049",
  trustName: "Delhi Educational and Research Foundation",
  address: "Plot 14, Knowledge Park III, Outer Ring Road",
  state: "Delhi",
  district: "Central Delhi",
  pincode: "110006",
  region: "Northern",
  contactEmail: "principal@diet-delhi.edu.in",
  contactPhone: "+91 11 2390 4500",
  accreditation: "NBA Tier-II (Accredited for 3 years)",
  establishedYear: 2012,
};

export const MOCK_INSTITUTION_APPLICATIONS: ApplicationDraft[] = [
  {
    applicationId: "AICTE/2026/APP-1042",
    type: "EXTENSION_OF_APPROVAL",
    program: "Engineering & Technology (UG/PG)",
    targetAcademicYear: "2026-2027",
    currentStage: "UNDER_REVIEW",
    stepProgress: 2,
    submissionDate: "2026-03-01",
    intakeRequested: 600,
    existingIntake: 480,
    slaDaysTotal: 30,
    slaDaysUsed: 12,
    deficiencies: [
      {
        id: "DEF-2026-042-1",
        ruleCode: "AICTE-RULE-FSR-1:20",
        description: "Faculty Student Ratio deficit detected in Computer Science & Engineering. Required 1:20, computed 1:26.7 based on enrolled intake 480 and 18 eligible faculty.",
        raisedBy: "Dr. A. K. Sharma (Scrutiny Officer)",
        raisedAt: "2026-03-05",
        dueAt: "2026-03-19",
        daysRemaining: 7,
        status: "RESPONSE_SUBMITTED",
        responseExplanation: "Appointed 6 new Assistant Professors with valid UGC-NET qualifications on 10-March-2026. Revised roster attached.",
        rectificationDocName: "CSE_Faculty_Appointment_Orders_Batch_2026.pdf",
      },
    ],
    documents: [
      {
        id: "DOC-1042-LAND",
        title: "Land Title & Registry Deed",
        category: "Land",
        status: "VERIFIED",
        fileName: "Land_Title_Khasra_412_1_Survey.pdf",
        fileSize: "4.8 MB",
        uploadedAt: "2026-03-01",
        verifiedAt: "2026-03-04",
        extractedValues: { landAreaAcres: 7.8, ownership: "Freehold Registered", zoning: "Institutional" },
      },
      {
        id: "DOC-1042-FIRE",
        title: "Fire Safety NOC",
        category: "Safety",
        status: "VERIFIED",
        fileName: "Fire_Safety_Certificate_2026_DFS.pdf",
        fileSize: "2.1 MB",
        uploadedAt: "2026-03-01",
        verifiedAt: "2026-03-04",
        extractedValues: { validityDate: "2027-02-28", issuingAuthority: "Delhi Fire Services", status: "Valid" },
      },
      {
        id: "DOC-1042-BLD",
        title: "Municipal Approved Building Plan",
        category: "Infrastructure",
        status: "VERIFIED",
        fileName: "Master_Building_Plan_MCD_Sanctioned.pdf",
        fileSize: "12.4 MB",
        uploadedAt: "2026-03-01",
        verifiedAt: "2026-03-04",
        extractedValues: { totalBuiltUpSqM: 16800, instructionalAreaSqM: 9200, barrierFreeAccess: "Yes" },
      },
      {
        id: "DOC-1042-FAC",
        title: "Faculty Cadre Roster & Bio-data",
        category: "Faculty",
        status: "DEFICIENT",
        fileName: "Faculty_Roster_Consolidated_2026.csv",
        fileSize: "840 KB",
        uploadedAt: "2026-03-01",
        notes: "Rule flag: FSR 1:26.7 in CSE department.",
      },
      {
        id: "DOC-1042-AFF",
        title: "State University Affiliation Order",
        category: "Affiliation",
        status: "VERIFIED",
        fileName: "Affiliation_Continuance_AKTU_2026.pdf",
        fileSize: "1.9 MB",
        uploadedAt: "2026-03-01",
        verifiedAt: "2026-03-03",
        extractedValues: { university: "Dr. A.P.J. Abdul Kalam Technical University", validUpto: "2027-06-30" },
      },
      {
        id: "DOC-1042-FDR",
        title: "Fixed Deposit Receipt (Endowment)",
        category: "Financial",
        status: "VERIFIED",
        fileName: "Joint_FDR_35Lakhs_SBI.pdf",
        fileSize: "1.2 MB",
        uploadedAt: "2026-03-01",
        verifiedAt: "2026-03-03",
        extractedValues: { amountInr: 3500000, bank: "State Bank of India", jointHolder: "Regional Officer AICTE" },
      },
    ],
  },
];

export const MOCK_SELF_CHECK_RULES = [
  {
    id: "RULE-LAND",
    category: "Land & Title",
    requirement: "Minimum contiguous land area of 7.5 Acres in Mega/Metro or 10.0 Acres in Rural",
    institutionValue: "7.80 Acres (Mega/Metro Category)",
    compliant: true,
    severity: "CRITICAL",
  },
  {
    id: "RULE-FSR",
    category: "Faculty Norms",
    requirement: "Faculty to Student Ratio must not exceed 1:20 in UG Engineering",
    institutionValue: "1:26.7 (CSE: 18 faculty for 480 students) -> Deficit 6 faculty",
    compliant: false,
    severity: "HIGH",
  },
  {
    id: "RULE-CADRE",
    category: "Cadre Ratio",
    requirement: "Cadre proportion 1 Professor : 2 Associate Professors : 6 Assistant Professors",
    institutionValue: "1:1.8:5.9 (Compliant within 10% tolerance)",
    compliant: true,
    severity: "MEDIUM",
  },
  {
    id: "RULE-BUILTUP",
    category: "Built-up Space",
    requirement: "Total instructional + administrative built-up area >= 14,200 sq.m",
    institutionValue: "16,800 sq.m (Sanctioned CPWD blueprint)",
    compliant: true,
    severity: "CRITICAL",
  },
  {
    id: "RULE-FIRE",
    category: "Safety NOC",
    requirement: "Valid Fire Safety NOC from State/UT Fire Department covering all blocks",
    institutionValue: "Valid upto 28-Feb-2027 (Delhi Fire Services)",
    compliant: true,
    severity: "CRITICAL",
  },
  {
    id: "RULE-BARRIER_FREE",
    category: "Divyangjan Accessibility",
    requirement: "Ramps, lifts, and dedicated accessible washrooms on all academic floors",
    institutionValue: "Lifts in Blocks A/B/C, ramps certified by architect",
    compliant: true,
    severity: "HIGH",
  },
];
