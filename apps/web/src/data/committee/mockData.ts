/**
 * Synthetic Dummy Data: Standing Hearing Committee (SHC) & Appellate Platform
 * Platform: Committee Chair and Empanelled Members
 * System: SETU / AICTE FlowGuard Prototype
 */

export interface HearingCaseItem {
  id: string;
  applicationId: string;
  instituteName: string;
  category: "LAND_DISPUTE" | "FACULTY_DEFICIT" | "FIRE_SAFETY_DELAY" | "AFFILIATION_LAPSE";
  primaryDiscrepancy: string;
  hearingDate: string;
  benchMembers: string[];
  collegeRepresentationSummary: string;
  legalAdvisorNote: string;
  quorumPresent: boolean;
  committeeDecision?: "RECOMMEND_APPROVAL" | "RECOMMEND_REJECTION" | "GRANT_CONDITIONAL_30_DAYS" | "ORDER_FRESH_EVC";
  resolutionMinutes?: string;
  votesInFavor: number;
  votesAgainst: number;
}

export const MOCK_COMMITTEE_CHAIR = {
  id: "SHC-CHAIR-01",
  name: "Prof. K. K. Aggarwal",
  title: "Chairman, Standing Hearing Committee (Central Bench)",
  quorumRequired: 3,
  activeDocketCount: 2,
};

export const MOCK_COMMITTEE_MEMBERS = [
  { id: "MBR-01", name: "Prof. K. K. Aggarwal", role: "Chairman (Former VC)" },
  { id: "MBR-02", name: "Dr. S. K. Kak", role: "Member (Former VC, MTU)" },
  { id: "MBR-03", name: "Justice (Retd.) B. N. Mathur", role: "Legal Member & Statutory Advisor" },
  { id: "MBR-04", name: "Dr. Manju Singh", role: "Member (Higher Education Expert)" },
  { id: "MBR-05", name: "Shri S. P. Goyal", role: "Industry Representative (CII)" },
];

export const MOCK_HEARING_DOCKET: HearingCaseItem[] = [
  {
    id: "HEAR-1035",
    applicationId: "AICTE/2026/APP-1035",
    instituteName: "St. Xavier's Engineering College",
    category: "LAND_DISPUTE",
    primaryDiscrepancy: "0.40 Acre land parcel contested under municipal road widening easement.",
    hearingDate: "2026-03-10",
    benchMembers: ["Prof. K. K. Aggarwal", "Justice (Retd.) B. N. Mathur", "Dr. S. K. Kak"],
    collegeRepresentationSummary: "Trust submitted gazette notification proving municipal corporation has acquired setback land with full transfer of development rights (TDR), leaving 7.60 Acres unencumbered instructional plot.",
    legalAdvisorNote: "TDR certificate and revised demarcation plan verified. Effective usable campus area satisfies AICTE metro norm of 7.50 Acres.",
    quorumPresent: true,
    committeeDecision: "GRANT_CONDITIONAL_30_DAYS",
    resolutionMinutes: "Unanimous bench resolution: Recommend approval subject to submission of revenue department's final demarcation certificate within 30 statutory days.",
    votesInFavor: 3,
    votesAgainst: 0,
  },
  {
    id: "HEAR-1022",
    applicationId: "AICTE/2026/APP-1022",
    instituteName: "Rural Engineering College",
    category: "LAND_DISPUTE",
    primaryDiscrepancy: "Critical land shortage: 6.80 Acres held vs 10.00 Acres required under rural norms.",
    hearingDate: "2026-03-20",
    benchMembers: ["Prof. K. K. Aggarwal", "Justice (Retd.) B. N. Mathur", "Dr. Manju Singh"],
    collegeRepresentationSummary: "Institution pleads future acquisition commitment in adjacent khasra and requests relaxation based on rural underserved taluka status.",
    legalAdvisorNote: "Clause 4.2 of Approval Process Handbook 2026 provides zero discretionary power to committee for relaxing mandatory contiguous land.",
    quorumPresent: true,
    committeeDecision: "RECOMMEND_REJECTION",
    resolutionMinutes: "Proposed rejection order drafted citing statutory non-compliance of basic land threshold.",
    votesInFavor: 3,
    votesAgainst: 0,
  },
];
