/**
 * Synthetic Dummy Data: Scrutiny Officer Platform
 * Platform: Technical Scrutiny Officers (e.g. Dr. A. K. Sharma)
 * System: SETU / AICTE FlowGuard Prototype
 */

export interface ScrutinyRuleFlag {
  id: string;
  ruleCode: string;
  ruleName: string;
  category: "LAND" | "INFRASTRUCTURE" | "FACULTY" | "AFFILIATION" | "SAFETY" | "FDR";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
  status: "VERIFIED_OK" | "FLAGGED_DEFICIENT" | "NEEDS_MANUAL_REVIEW";
  evidenceText: string;
  documentSource: string;
  pageNumber?: number;
  extractedValue: string;
  mandatoryNorm: string;
  aiConfidence: number; // 0.0 to 1.0
  notes: string;
}

export interface ScrutinyDocket {
  applicationId: string;
  instituteName: string;
  region: string;
  assignedOfficer: string;
  receivedDate: string;
  slaDeadline: string;
  slaUsedPercent: number;
  flags: ScrutinyRuleFlag[];
  overallRecommendation?: "CLEAR_TO_REGIONAL" | "RECOMMEND_EVC_VISIT" | "ISSUE_DEFICIENCY_NOTICE" | "REJECT";
  lastActionNotes?: string;
}

export const MOCK_SCRUTINY_OFFICER = {
  id: "OFFICER-SCRUTINY-01",
  name: "Dr. A. K. Sharma",
  title: "Senior Technical Scrutiny Officer",
  region: "Northern Regional Office (NRO)",
  specialization: "Computer Science & Engineering Accreditations",
  pendingReviewsCount: 3,
  completedTodayCount: 4,
};

export const MOCK_SCRUTINY_DOCKETS: ScrutinyDocket[] = [
  {
    applicationId: "AICTE/2026/APP-1042",
    instituteName: "Sunrise Institute of Technology",
    region: "Northern",
    assignedOfficer: "Dr. A. K. Sharma",
    receivedDate: "2026-03-02",
    slaDeadline: "2026-03-12",
    slaUsedPercent: 60,
    flags: [
      {
        id: "FLAG-1042-01",
        ruleCode: "AICTE-NORM-LAND-CONTIGUOUS",
        ruleName: "Contiguous Land Holding & Title Deed",
        category: "LAND",
        severity: "CRITICAL",
        status: "VERIFIED_OK",
        evidenceText: "Survey parcel registered in name of Sunrise Educational Trust at Khasra 412/1 without encumbrance.",
        documentSource: "Land_Title_Deed_Khasra412.pdf",
        pageNumber: 3,
        extractedValue: "7.80 Acres Contiguous",
        mandatoryNorm: "Minimum 7.50 Acres (Metro/Mega)",
        aiConfidence: 0.98,
        notes: "Verified against State Revenue Department portal.",
      },
      {
        id: "FLAG-1042-02",
        ruleCode: "AICTE-NORM-FSR-1:20",
        ruleName: "Faculty-to-Student Ratio (UG Engineering)",
        category: "FACULTY",
        severity: "CRITICAL",
        status: "FLAGGED_DEFICIENT",
        evidenceText: "CSE department enrolled intake 480 students. Active full-time faculty roster has only 18 validated faculty. FSR is 1:26.7.",
        documentSource: "Faculty_Roster_Consolidated_2026.csv",
        extractedValue: "1:26.7 (18 faculty for 480 intake)",
        mandatoryNorm: "Max 1:20 (requires minimum 24 faculty)",
        aiConfidence: 0.99,
        notes: "Statutory deficiency raised on 05-March-2026 (14-day cure window). Institution response received on 12-March with 6 new appointments.",
      },
      {
        id: "FLAG-1042-03",
        ruleCode: "AICTE-NORM-FIRE-SAFETY",
        ruleName: "Building Fire Safety Compliance NOC",
        category: "SAFETY",
        severity: "CRITICAL",
        status: "VERIFIED_OK",
        evidenceText: "Certificate No DFS/HQ/2025/1109 valid through 28-Feb-2027 signed by Chief Fire Officer.",
        documentSource: "Fire_NOC_2026.pdf",
        pageNumber: 1,
        extractedValue: "Valid through 28-Feb-2027",
        mandatoryNorm: "Unexpired NOC covering instructional & residential blocks",
        aiConfidence: 0.96,
        notes: "Fire hydrants and mock drill report verified in annexure.",
      },
      {
        id: "FLAG-1042-04",
        ruleCode: "AICTE-NORM-CADRE-1:2:6",
        ruleName: "Cadre Distribution Ratio",
        category: "FACULTY",
        severity: "MEDIUM",
        status: "VERIFIED_OK",
        evidenceText: "Professor: 2, Associate Professor: 4, Assistant Professor: 12 in CSE. Cadre proportion 1:2:6 fulfilled.",
        documentSource: "Faculty_Roster_Consolidated_2026.csv",
        extractedValue: "2 Prof : 4 Assoc Prof : 12 Asst Prof",
        mandatoryNorm: "Proportion 1 : 2 : 6",
        aiConfidence: 0.94,
        notes: "All professors hold Ph.D from recognized universities.",
      },
    ],
    overallRecommendation: "RECOMMEND_EVC_VISIT",
    lastActionNotes: "Physical EVC visit recommended to verify new faculty biometric attendance and lab equipment.",
  },
  {
    applicationId: "AICTE/2026/APP-1038",
    instituteName: "Greenfield Institute of Engineering",
    region: "Northern",
    assignedOfficer: "Dr. A. K. Sharma",
    receivedDate: "2026-03-04",
    slaDeadline: "2026-03-14",
    slaUsedPercent: 40,
    flags: [
      {
        id: "FLAG-1038-01",
        ruleCode: "AICTE-NORM-LAND-CONTIGUOUS",
        ruleName: "Contiguous Land Area",
        category: "LAND",
        severity: "CRITICAL",
        status: "VERIFIED_OK",
        evidenceText: "10.2 Acres contiguous land parcel with CPWD boundary wall.",
        documentSource: "Registered_Deed_Greenfield.pdf",
        extractedValue: "10.20 Acres",
        mandatoryNorm: "Minimum 10.0 Acres (Rural Category)",
        aiConfidence: 0.97,
        notes: "Clean title deed without bank mortgage.",
      },
      {
        id: "FLAG-1038-02",
        ruleCode: "AICTE-NORM-SAFETY-NOC",
        ruleName: "Fire Safety NOC",
        category: "SAFETY",
        severity: "CRITICAL",
        status: "NEEDS_MANUAL_REVIEW",
        evidenceText: "Provisional fire clearance submitted. Final fire NOC pending from district fire department.",
        documentSource: "Provisional_Fire_Receipt.pdf",
        extractedValue: "Provisional Receipt Only",
        mandatoryNorm: "Final Certificate of Occupancy & Fire NOC",
        aiConfidence: 0.89,
        notes: "Awaiting final clearance before recommending EVC.",
      },
    ],
    overallRecommendation: "ISSUE_DEFICIENCY_NOTICE",
  },
  {
    applicationId: "AICTE/2026/APP-1022",
    instituteName: "Rural Engineering College",
    region: "Northern",
    assignedOfficer: "Dr. A. K. Sharma",
    receivedDate: "2026-03-01",
    slaDeadline: "2026-03-11",
    slaUsedPercent: 90,
    flags: [
      {
        id: "FLAG-1022-01",
        ruleCode: "AICTE-NORM-LAND-AREA",
        ruleName: "Contiguous Rural Land Requirement",
        category: "LAND",
        severity: "CRITICAL",
        status: "FLAGGED_DEFICIENT",
        evidenceText: "Registry document shows parcel area of 6.80 Acres. Institution claims rural exemption, but rural norm requires 10.0 Acres.",
        documentSource: "Land_Record_Rural.pdf",
        extractedValue: "6.80 Acres",
        mandatoryNorm: "Minimum 10.0 Acres",
        aiConfidence: 0.99,
        notes: "Deficit of 3.20 acres. Statutory deficit cannot be cured by affidavit.",
      },
    ],
    overallRecommendation: "ISSUE_DEFICIENCY_NOTICE",
  },
];
