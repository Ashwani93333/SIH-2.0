/**
 * Synthetic Dummy Data: Regional Officer Command Platform
 * Platform: Regional Directorate Command (e.g. Dr. R. K. Singhania, Northern Regional Office)
 * System: SETU / AICTE FlowGuard Prototype
 */

export interface RegionalOfficerInfo {
  id: string;
  name: string;
  designation: string;
  region: string;
  officeLocation: string;
  statesCovered: string[];
}

export interface RegionalScrutinyStaff {
  officerId: string;
  name: string;
  cadre: string;
  activeDockets: number;
  capacityLimit: number;
  onTimeCompletionRate: number; // percentage
  status: "AVAILABLE" | "NEAR_CAPACITY" | "ON_LEAVE";
}

export interface RegionalApplicationItem {
  applicationId: string;
  instituteName: string;
  instituteCode: string;
  state: string;
  district: string;
  type: string;
  stage: "INTAKE" | "TECHNICAL_SCRUTINY" | "EVC_VISIT" | "COMMITTEE" | "FINAL_DECISION";
  assignedTo?: string;
  unassignedHours: number;
  slaBreachRisk: "SAFE" | "WARNING" | "CRITICAL_BREACH";
  submissionDate: string;
  daysInCurrentStage: number;
  statutoryDeficienciesCount: number;
}

export const MOCK_REGIONAL_OFFICER: RegionalOfficerInfo = {
  id: "RO-NORTH-01",
  name: "Dr. R. K. Singhania",
  designation: "Regional Officer & Director",
  region: "Northern Regional Office (NRO)",
  officeLocation: "Chandigarh & Regional Camp Delhi",
  statesCovered: ["Delhi", "Haryana", "Punjab", "Himachal Pradesh", "Jammu & Kashmir", "Uttar Pradesh"],
};

export const MOCK_REGIONAL_STAFF: RegionalScrutinyStaff[] = [
  {
    officerId: "OFFICER-SCRUTINY-01",
    name: "Dr. A. K. Sharma",
    cadre: "Senior Scrutiny Officer",
    activeDockets: 3,
    capacityLimit: 5,
    onTimeCompletionRate: 96,
    status: "AVAILABLE",
  },
  {
    officerId: "OFFICER-SCRUTINY-02",
    name: "Prof. Meenakshi Sundaram",
    cadre: "Technical Scrutiny Officer",
    activeDockets: 4,
    capacityLimit: 5,
    onTimeCompletionRate: 98,
    status: "NEAR_CAPACITY",
  },
  {
    officerId: "OFFICER-SCRUTINY-03",
    name: "Er. Rajiv Tandon",
    cadre: "Scrutiny Officer",
    activeDockets: 2,
    capacityLimit: 4,
    onTimeCompletionRate: 91,
    status: "AVAILABLE",
  },
  {
    officerId: "OFFICER-SCRUTINY-04",
    name: "Dr. Sunita Deshmukh",
    cadre: "Scrutiny Officer (Affiliations)",
    activeDockets: 1,
    capacityLimit: 4,
    onTimeCompletionRate: 100,
    status: "AVAILABLE",
  },
];

export const MOCK_REGIONAL_APPLICATIONS: RegionalApplicationItem[] = [
  {
    applicationId: "AICTE/2026/APP-1042",
    instituteName: "Sunrise Institute of Technology",
    instituteCode: "AICTE-UP-8821",
    state: "Uttar Pradesh",
    district: "Gautam Buddha Nagar",
    type: "Extension of Approval (EOA)",
    stage: "TECHNICAL_SCRUTINY",
    assignedTo: "Dr. A. K. Sharma",
    unassignedHours: 0,
    slaBreachRisk: "SAFE",
    submissionDate: "2026-03-01",
    daysInCurrentStage: 5,
    statutoryDeficienciesCount: 1,
  },
  {
    applicationId: "AICTE/2026/APP-1038",
    instituteName: "Greenfield Institute of Engineering",
    instituteCode: "AICTE-HR-9012",
    state: "Haryana",
    district: "Faridabad",
    type: "New Institute Establishment",
    stage: "TECHNICAL_SCRUTINY",
    assignedTo: "Dr. A. K. Sharma",
    unassignedHours: 0,
    slaBreachRisk: "SAFE",
    submissionDate: "2026-03-04",
    daysInCurrentStage: 2,
    statutoryDeficienciesCount: 0,
  },
  {
    applicationId: "AICTE/2026/APP-1022",
    instituteName: "Rural Engineering College",
    instituteCode: "AICTE-UP-4412",
    state: "Uttar Pradesh",
    district: "Budaun",
    type: "New Institute Approval",
    stage: "INTAKE",
    assignedTo: undefined,
    unassignedHours: 46, // Approaching 48h SLA breach
    slaBreachRisk: "CRITICAL_BREACH",
    submissionDate: "2026-03-05",
    daysInCurrentStage: 2,
    statutoryDeficienciesCount: 1,
  },
  {
    applicationId: "AICTE/2026/APP-1018",
    instituteName: "Metropolitan Skill Institute",
    instituteCode: "AICTE-DL-3104",
    state: "Delhi",
    district: "New Delhi",
    type: "Introduction of Emerging Tech Courses",
    stage: "EVC_VISIT",
    assignedTo: "Prof. Meenakshi Sundaram",
    unassignedHours: 0,
    slaBreachRisk: "SAFE",
    submissionDate: "2026-02-24",
    daysInCurrentStage: 9,
    statutoryDeficienciesCount: 0,
  },
];
