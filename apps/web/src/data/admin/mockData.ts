/**
 * Synthetic Dummy Data: System Admin & Cryptographic Audit Ledger Platform
 * Platform: System Administrators, Auditors, Simulation Lab
 * System: SETU / AICTE FlowGuard Prototype
 */

export interface CanonicalScenarioSummary {
  id: string;
  folderName: string;
  applicationId: string;
  instituteName: string;
  region: string;
  scenarioType: string;
  stage: "INTAKE" | "TECHNICAL_SCRUTINY" | "EVC_VISIT" | "COMMITTEE" | "FINAL_DECISION";
  primaryIssue: string;
  expectedOutcome: "APPROVAL" | "REJECTION" | "CONDITIONAL_APPROVAL" | "PENDING_VISIT";
  narrative: string;
}

export interface CryptographicAuditEntry {
  sequenceNumber: number;
  timestamp: string;
  role: string;
  actorId: string;
  actorName: string;
  action: string;
  targetEntity: string;
  details: string;
  previousHash: string;
  currentHash: string;
  isValidChain: boolean;
}

export const CANONICAL_SCENARIOS_LIST: CanonicalScenarioSummary[] = [
  {
    id: "SCENARIO-1",
    folderName: "APP-1042_Sunrise",
    applicationId: "AICTE/2026/APP-1042",
    instituteName: "Sunrise Institute of Technology",
    region: "Northern",
    scenarioType: "Hero Case - Faculty Student Ratio Deficit",
    stage: "TECHNICAL_SCRUTINY",
    primaryIssue: "FSR 1:26.7 in CSE department vs 1:20 mandatory norm. 14-day statutory cure window used to upload 6 appointment letters.",
    expectedOutcome: "PENDING_VISIT",
    narrative: "Demonstrates the complete human-in-the-loop statutory lifecycle with transparent 14-day deficiency cure.",
  },
  {
    id: "SCENARIO-2",
    folderName: "APP-1038_Greenfield",
    applicationId: "AICTE/2026/APP-1038",
    instituteName: "Greenfield Institute of Engineering",
    region: "Northern",
    scenarioType: "New Institution Establishment",
    stage: "TECHNICAL_SCRUTINY",
    primaryIssue: "Clean contiguous land of 10.2 acres verified. Fire NOC provisional receipt pending final certificate.",
    expectedOutcome: "CONDITIONAL_APPROVAL",
    narrative: "Validates multi-hectare land polygon analysis and provisional safety documentation.",
  },
  {
    id: "SCENARIO-3",
    folderName: "APP-1035_StXaviers",
    applicationId: "AICTE/2026/APP-1035",
    instituteName: "St. Xavier's Engineering College",
    region: "Western",
    scenarioType: "Contested Land Easement at SHC",
    stage: "COMMITTEE",
    primaryIssue: "Municipal road setback reduced plot from 8.0 to 7.6 acres. SHC resolved using TDR gazette notification.",
    expectedOutcome: "CONDITIONAL_APPROVAL",
    narrative: "Demonstrates transparent Hearing Committee docket minutes and legal advisor notes.",
  },
  {
    id: "SCENARIO-4",
    folderName: "APP-1029_NationalSkill",
    applicationId: "AICTE/2026/APP-1029",
    instituteName: "National Skill Polytechnic",
    region: "Central",
    scenarioType: "Fast-Track Autonomous EOA",
    stage: "FINAL_DECISION",
    primaryIssue: "100% automated pass on all norms. NBA Tier-1 accreditation allows expedited processing.",
    expectedOutcome: "APPROVAL",
    narrative: "Demonstrates high-velocity automated checks for pristine applications.",
  },
  {
    id: "SCENARIO-5",
    folderName: "APP-1022_Rural",
    applicationId: "AICTE/2026/APP-1022",
    instituteName: "Rural Engineering College",
    region: "Northern",
    scenarioType: "Mandatory Contiguous Land Shortage",
    stage: "COMMITTEE",
    primaryIssue: "Holds 6.80 acres against non-negotiable 10.00 acres rural requirement. Discretionary relaxation denied.",
    expectedOutcome: "REJECTION",
    narrative: "Illustrates rule-deterministic fairness where non-negotiable statutory thresholds cannot be bypassed.",
  },
  {
    id: "SCENARIO-6",
    folderName: "APP-1018_Metropolitan",
    applicationId: "AICTE/2026/APP-1018",
    instituteName: "Metropolitan Skill Institute",
    region: "Northern",
    scenarioType: "Fully Cleared & Digitally Signed Approval",
    stage: "FINAL_DECISION",
    primaryIssue: "All inspections completed. Signed by Member Secretary with cryptographic SHA-256 seal.",
    expectedOutcome: "APPROVAL",
    narrative: "Exemplifies end-to-end statutory order dispatch with tamper-evident digital seal.",
  },
  {
    id: "SCENARIO-7",
    folderName: "APP-1010_Coastal",
    applicationId: "AICTE/2026/APP-1010",
    instituteName: "Coastal Engineering Academy",
    region: "Southern",
    scenarioType: "Coastal Regulation Zone (CRZ) Clearance",
    stage: "TECHNICAL_SCRUTINY",
    primaryIssue: "Campus within 500m of tidal line. Environmental clearances and CRZ-II certificate authenticated.",
    expectedOutcome: "APPROVAL",
    narrative: "Validates ecological and coastal zone statutory verification checks.",
  },
  {
    id: "SCENARIO-8",
    folderName: "APP-1005_Hilltop",
    applicationId: "AICTE/2026/APP-1005",
    instituteName: "Hilltop Technical Institute",
    region: "Northern",
    scenarioType: "Hilly Terrain Land Relaxation",
    stage: "TECHNICAL_SCRUTINY",
    primaryIssue: "Site elevation 2,100 meters above sea level. AICTE Hilly Area 2.5-acre norm applied and verified.",
    expectedOutcome: "APPROVAL",
    narrative: "Demonstrates correct contextual application of terrain-based statutory exceptions.",
  },
];

export const MOCK_AUDIT_LEDGER: CryptographicAuditEntry[] = [
  {
    sequenceNumber: 1,
    timestamp: "2026-03-01T10:15:22Z",
    role: "INSTITUTION",
    actorId: "INST-DELHI-001",
    actorName: "Principal, DIET Delhi",
    action: "APPLICATION_SUBMITTED",
    targetEntity: "AICTE/2026/APP-1042",
    details: "EOA application submitted with 6 uploaded statutory documents and fee receipt.",
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
    currentHash: "a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    isValidChain: true,
  },
  {
    sequenceNumber: 2,
    timestamp: "2026-03-02T09:40:10Z",
    role: "REGIONAL_OFFICER",
    actorId: "RO-NORTH-01",
    actorName: "Dr. R. K. Singhania",
    action: "ALLOCATED_TO_SCRUTINY",
    targetEntity: "AICTE/2026/APP-1042",
    details: "Assigned to Dr. A. K. Sharma (Senior Technical Scrutiny Officer).",
    previousHash: "a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e",
    currentHash: "b2c3d4e5f6a708192a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
    isValidChain: true,
  },
  {
    sequenceNumber: 3,
    timestamp: "2026-03-05T14:22:45Z",
    role: "SCRUTINY_OFFICER",
    actorId: "OFFICER-SCRUTINY-01",
    actorName: "Dr. A. K. Sharma",
    action: "RAISED_STATUTORY_DEFICIENCY",
    targetEntity: "AICTE/2026/APP-1042",
    details: "FSR deficit in CSE Department (1:26.7 vs 1:20 norm). 14-day statutory cure clock started.",
    previousHash: "b2c3d4e5f6a708192a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f",
    currentHash: "c3d4e5f6a7b8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    isValidChain: true,
  },
  {
    sequenceNumber: 4,
    timestamp: "2026-03-12T11:05:18Z",
    role: "INSTITUTION",
    actorId: "INST-DELHI-001",
    actorName: "Principal, DIET Delhi",
    action: "DEFICIENCY_RESPONSE_SUBMITTED",
    targetEntity: "AICTE/2026/APP-1042",
    details: "Uploaded revised faculty roster and appointment letters for 6 new Assistant Professors.",
    previousHash: "c3d4e5f6a7b8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a",
    currentHash: "d4e5f6a7b8c90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    isValidChain: true,
  },
  {
    sequenceNumber: 5,
    timestamp: "2026-03-14T16:50:30Z",
    role: "EVC_COORDINATOR",
    actorId: "EVC-COORD-01",
    actorName: "Prof. Ramesh Rao",
    action: "SCHEDULED_EVC_VISIT",
    targetEntity: "AICTE/2026/APP-1042",
    details: "Scheduled physical inspection on 18-March-2026 with Dr. Radhakrishnan and Prof. Varma.",
    previousHash: "d4e5f6a7b8c90a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    currentHash: "e5f6a7b8c9d01b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c",
    isValidChain: true,
  },
];
