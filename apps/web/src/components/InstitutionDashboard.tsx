"use client";

import React, { useState } from "react";
import {
  MOCK_INSTITUTION_PROFILE,
  MOCK_INSTITUTION_APPLICATIONS,
  MOCK_SELF_CHECK_RULES,
  ApplicationDraft,
  DocumentItem,
} from "../data";

interface InstitutionDashboardProps {
  onAddAuditEntry: (action: string, target: string, details: string) => void;
  sharedApplications?: ApplicationDraft[];
  onUpdateApplications?: (apps: ApplicationDraft[]) => void;
}

interface UploadedFileRecord {
  category: DocumentItem["category"];
  title: string;
  fileName: string;
  fileSize: string;
  uploadedAt: string;
  status: DocumentItem["status"];
  ocrConfidence: number;
  extractedValues?: Record<string, string | number>;
  fileBlobUrl?: string;
  certificateNumber?: string;
  issuingAuthority?: string;
  institutionName?: string;
  validityDate?: string;
  validationFindings?: string[];
  isVerified?: boolean;
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({
  onAddAuditEntry,
  sharedApplications,
  onUpdateApplications,
}) => {
  const [applications, setApplications] = useState<ApplicationDraft[]>(
    sharedApplications || MOCK_INSTITUTION_APPLICATIONS
  );
  const [activeTab, setActiveTab] = useState<
    "applications" | "new_approval" | "deficiencies" | "payments" | "profile" | "self_check" | "vault"
  >("applications");

  // Selected Application for Inspection Modal
  const [selectedAppModal, setSelectedAppModal] = useState<ApplicationDraft | null>(null);

  // Selected Application for Official 2026-27 EoA Letter Viewer Modal
  const [selectedEoaModal, setSelectedEoaModal] = useState<ApplicationDraft | null>(null);

  // Regulatory Fee Payment State (Bharatkosh / PFMS)
  const [feePaid, setFeePaid] = useState<boolean>(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<{
    title: string;
    fileName: string;
    fileSize?: string;
    category?: string;
    ocrConfidence?: number;
    extractedValues?: Record<string, string | number>;
    fileBlobUrl?: string;
    certificateNumber?: string;
    issuingAuthority?: string;
    institutionName?: string;
    validityDate?: string;
    validationFindings?: string[];
    isVerified?: boolean;
  } | null>(null);

  // Deficiency Response State
  const [responseText, setResponseText] = useState("");
  const [rectificationFile, setRectificationFile] = useState<string | null>(null);
  const [responseToast, setResponseToast] = useState<string | null>(null);

  // --- Registration Wizard State ---
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [regType, setRegType] = useState<ApplicationDraft["type"]>("NEW_COURSE");
  const [regProgram, setRegProgram] = useState<string>("B.Tech Artificial Intelligence & Data Science");
  const [regCategory, setRegCategory] = useState<string>("Engineering & Technology (UG)");
  const [regExistingIntake, setRegExistingIntake] = useState<number>(480);
  const [regRequestedIntake, setRegRequestedIntake] = useState<number>(60);
  const [regAcademicYear, setRegAcademicYear] = useState<string>("2026-2027");

  // Infrastructure inputs
  const [regBuiltupArea, setRegBuiltupArea] = useState<number>(14500);
  const [regClassrooms, setRegClassrooms] = useState<number>(24);
  const [regLabs, setRegLabs] = useState<number>(16);

  // Faculty Cadre inputs
  const [regProfessors, setRegProfessors] = useState<number>(4);
  const [regAssocProfessors, setRegAssocProfessors] = useState<number>(8);
  const [regAsstProfessors, setRegAsstProfessors] = useState<number>(22);

  // Mandatory Statutory Documents Upload State
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFileRecord>>({
    land_title: {
      category: "Land",
      title: "Land Title Deed & Non-Encumbrance Certificate",
      fileName: "DIET_Land_Registry_Plot14_KnowledgePark.pdf",
      fileSize: "6.4 MB",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "VERIFIED",
      ocrConfidence: 99.2,
      extractedValues: { "Land Area (Acres)": "7.5 Acres", "Ownership": "Perpetual Clear Title", "Zoning": "Institutional / Educational" },
    },
    fire_noc: {
      category: "Safety",
      title: "State Fire & Rescue Services NOC",
      fileName: "Delhi_Fire_Service_NOC_2026.pdf",
      fileSize: "3.2 MB",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "VERIFIED",
      ocrConfidence: 98.7,
      extractedValues: { "Issue Date": "2026-01-15", "Valid Till": "2027-01-14", "Coverage": "Entire Instructional Block A & B" },
    },
  });

  // OCR + LLM Simulation State
  const [isProcessingDoc, setIsProcessingDoc] = useState<boolean>(false);
  const [activeScanningKey, setActiveScanningKey] = useState<string | null>(null);
  const [scanStepIndex, setScanStepIndex] = useState<number>(0);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [stagedDocForProcess, setStagedDocForProcess] = useState<{
    key: string;
    file: File | null;
    preset?: (typeof MANDATORY_DOCUMENTS_SCHEMA)[0];
    fileName: string;
    fileSize: string;
  } | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const SCAN_STEPS = [
    { title: "Uploading document…", desc: "Verifying binary stream & SHA-256 cryptographic checksum" },
    { title: "Initializing OCR engine…", desc: "Loading Tesseract/PaddleOCR optical character models" },
    { title: "Extracting text and certificate fields…", desc: "Recognizing statutory seals, stamps, dates, and authority clauses" },
    { title: "Sending extracted data to the LLM validation stage…", desc: "Transmitting structured tokens to assistive compliance engine" },
    { title: "Checking required fields and document completeness…", desc: "Cross-evaluating APH 2026-27 statutory norms & expiry parameters" },
    { title: "Preparing verification report…", desc: "Finalizing confidence vectors and audit record" }
  ];

  // Calculate live FSR
  const totalFaculty = regProfessors + regAssocProfessors + regAsstProfessors;
  const totalStudents = regExistingIntake + regRequestedIntake;
  const computedFsrRatio = totalFaculty > 0 ? (totalStudents / totalFaculty).toFixed(1) : "0";
  const isFsrCompliant = parseFloat(computedFsrRatio) <= 20.0;

  // Sync back to shared applications if provided
  const updateApps = (newApps: ApplicationDraft[]) => {
    setApplications(newApps);
    if (onUpdateApplications) {
      onUpdateApplications(newApps);
    }
  };

  // Mock document presets for quick synthetic demo filling
  const MANDATORY_DOCUMENTS_SCHEMA = [
    {
      key: "land_title",
      title: "Land Title Deed & Non-Encumbrance Certificate",
      category: "Land" as const,
      description: "Registered sale deed / gift deed with sub-registrar endorsement showing perpetual possession.",
      sampleFileName: "DIET_Land_Registry_Plot14_KnowledgePark.pdf",
      sampleSize: "6.4 MB",
      sampleValues: { "Land Area (Acres)": "7.5 Acres", "Ownership": "Perpetual Clear Title" },
    },
    {
      key: "building_plan",
      title: "Building Occupancy & Architectural Floor Plan",
      category: "Infrastructure" as const,
      description: "PWD/Municipal Corporation certified structural stability and instructional carpet area map.",
      sampleFileName: "Architectural_Plan_Approved_Blocks_ABC.pdf",
      sampleSize: "8.1 MB",
      sampleValues: { "Instructional Area": "14,500 sq.m", "Classrooms": "24", "Laboratories": "16" },
    },
    {
      key: "fire_noc",
      title: "State Fire & Emergency Services NOC",
      category: "Safety" as const,
      description: "State Fire Service clearance covering fire hydrant, smoke alarms, and emergency exits.",
      sampleFileName: "Delhi_Fire_Service_NOC_2026.pdf",
      sampleSize: "3.2 MB",
      sampleValues: { "Valid Until": "2027-01-14", "Hydrant Compliance": "Verified PASS" },
    },
    {
      key: "faculty_roster",
      title: "AICTE Cadre Faculty Roster & Bank Salary Slips",
      category: "Faculty" as const,
      description: "Duly signed roster with PAN, Aadhaar, qualification proof, and Form 16 / ECS salary records.",
      sampleFileName: "AICTE_Cadre_Roster_Signed_Form16.xlsx",
      sampleSize: "4.5 MB",
      sampleValues: { "Faculty Count": totalFaculty, "FSR Ratio": `1:${computedFsrRatio}`, "Cadre Ratio": `${regProfessors}:${regAssocProfessors}:${regAsstProfessors}` },
    },
    {
      key: "barrier_free",
      title: "Barrier-Free Accessibility Certificate",
      category: "Infrastructure" as const,
      description: "Architect certificate for wheelchair ramps, Divyangjan-friendly lifts, and dedicated washrooms.",
      sampleFileName: "Accessibility_Ramp_Lift_Certificate.pdf",
      sampleSize: "2.8 MB",
      sampleValues: { "Ramps Present": "Yes", "Braille Lifts": "2 Operational" },
    },
    {
      key: "affiliation_order",
      title: "University Affiliation Resolution / Order",
      category: "Affiliation" as const,
      description: "Affiliation letter from the State Technical University / University of Delhi for AY 2026-27.",
      sampleFileName: "Affiliation_Resolution_University_Delhi.pdf",
      sampleSize: "2.1 MB",
      sampleValues: { "Affiliating Body": "Delhi Technological University", "Validity": "2026-2027" },
    },
  ];

  // Predefined mock metadata generator for simulated OCR + LLM results
  const getMockOcrLlmResults = (key: string, fileName: string) => {
    const mockMap: Record<string, { certNo: string; authority: string; instName: string; validity: string; score: number; findings: string[] }> = {
      land_title: {
        certNo: "REG-DL-2024/7821-LND",
        authority: "Office of the Sub-Registrar IV, GNCT Delhi",
        instName: "Delhi Institute of Engineering & Technology (DIET)",
        validity: "Perpetual Title / Indefinite",
        score: 99.4,
        findings: [
          "Clear, unencumbered 7.50-acre educational land zoning confirmed.",
          "Sub-registrar digital endorsement stamp verified against cadastral survey.",
          "Non-alienable educational trust lease clause complies with APH Norms 2026-27."
        ]
      },
      building_plan: {
        certNo: "PWD-CZ/BLD-2025/1104",
        authority: "Central Public Works Department (CPWD) / MCD",
        instName: "Delhi Institute of Engineering & Technology",
        validity: "Approved for AY 2026-2031",
        score: 98.8,
        findings: [
          "Instructional carpet area (14,500 sq.m) satisfies prescribed ceiling norms.",
          "24 smart classrooms & 16 laboratories meet barrier-free safety requirements.",
          "Structural stability compliance certificate signed by registered structural engineer."
        ]
      },
      fire_noc: {
        certNo: "DFS/HQ/2026/F-NOC-449",
        authority: "Delhi Fire Services, Govt. of NCT of Delhi",
        instName: "Delhi Institute of Engineering & Technology, Campus Block A/B",
        validity: "Valid until 14-Jan-2027",
        score: 99.1,
        findings: [
          "Fire hydrants, wet risers, and hose reels verified operational across all floors.",
          "Auto-alarm and smoke extraction systems fully functional in laboratory wings.",
          "Fire exit staircases (2.0m width) fully compliant with NBC Part IV standards."
        ]
      },
      faculty_roster: {
        certNo: "FAC-ROST/2026-AY-901",
        authority: "Registrar / Academic Board of Governors",
        instName: "Delhi Institute of Engineering & Technology",
        validity: "AY 2026-2027 Academic Session",
        score: 99.6,
        findings: [
          "34 regular approved faculty members cross-verified with Aadhaar & PAN registries.",
          "FSR ratio computed at 1:17.6, comfortably within APH 1:20 mandatory limit.",
          "Bank ECS salary disbursement and Form 16 statements verified."
        ]
      },
      barrier_free: {
        certNo: "PWD/ACC-BF/2025/338",
        authority: "National Accessibility Council / State PWD",
        instName: "Delhi Institute of Engineering & Technology",
        validity: "Certified AY 2026-2028",
        score: 98.5,
        findings: [
          "Continuous gradient wheelchair ramps operational at all instructional block entries.",
          "Two Divyangjan-friendly Braille audio elevators inspected and certified.",
          "Dedicated accessible washrooms provided on every educational floor."
        ]
      },
      affiliation_order: {
        certNo: "DTU/AFFIL/ACAD/2026/892",
        authority: "Delhi Technological University (Affiliating University)",
        instName: "Delhi Institute of Engineering & Technology (Affiliated Campus)",
        validity: "Academic Year 2026-2027",
        score: 99.3,
        findings: [
          "Affiliation resolution passed by University Academic Council on 12-Feb-2026.",
          "Permanent sanctioned course programs and seat matrices verified.",
          "University affiliation status active without pending academic inquiries."
        ]
      }
    };

    return mockMap[key] || {
      certNo: `AICTE-VER-${key.toUpperCase()}-2026`,
      authority: "Statutory Competent Authority",
      instName: "Delhi Institute of Engineering & Technology",
      validity: "30-June-2027",
      score: 98.9,
      findings: [
        "Digital seal checksum verified against national registry database.",
        "Document completeness check: all mandatory statutory clauses identified.",
        "LLM compliance evaluation confirmed zero procedural deviations."
      ]
    };
  };

  // Launch Simulated 5-6 Second OCR + LLM Pipeline
  const startProcessingAnimation = (key: string, file: File | null, preset?: (typeof MANDATORY_DOCUMENTS_SCHEMA)[0]) => {
    if (isProcessingDoc) return; // Prevent concurrent submissions

    setProcessingError(null);
    setActiveScanningKey(key);
    setIsProcessingDoc(true);
    setScanStepIndex(0);
    setScanProgress(0);

    const fName = file ? file.name : (preset ? preset.sampleFileName : `${key}_document.pdf`);
    const fSize = file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : (preset ? preset.sampleSize : "3.5 MB");

    setStagedDocForProcess({
      key,
      file,
      preset,
      fileName: fName,
      fileSize: fSize
    });

    const totalDuration = 5400; // ~5.4 seconds realistic processing
    const intervalTime = 60;
    const totalTicks = totalDuration / intervalTime;
    let currentTick = 0;

    const timer = setInterval(() => {
      currentTick += 1;
      const progressRatio = Math.min(currentTick / totalTicks, 1);
      const currentPct = Math.round(progressRatio * 100);
      setScanProgress(currentPct);

      // Step indices (0 to 5) mapped across 100%
      if (currentPct < 15) setScanStepIndex(0);
      else if (currentPct < 32) setScanStepIndex(1);
      else if (currentPct < 52) setScanStepIndex(2);
      else if (currentPct < 70) setScanStepIndex(3);
      else if (currentPct < 88) setScanStepIndex(4);
      else setScanStepIndex(5);

      if (currentTick >= totalTicks) {
        clearInterval(timer);

        // Generate Predefined Mock Result
        const mockData = getMockOcrLlmResults(key, fName);
        const blobUrl = file ? URL.createObjectURL(file) : undefined;

        const newRec: UploadedFileRecord = {
          category: preset ? preset.category : "Infrastructure",
          title: preset ? preset.title : fName,
          fileName: fName,
          fileSize: fSize,
          uploadedAt: new Date().toISOString().split("T")[0],
          status: "VERIFIED",
          ocrConfidence: mockData.score,
          certificateNumber: mockData.certNo,
          issuingAuthority: mockData.authority,
          institutionName: mockData.instName,
          validityDate: mockData.validity,
          validationFindings: mockData.findings,
          isVerified: true,
          extractedValues: (preset?.sampleValues || {
            "Certificate No": mockData.certNo,
            "Issuing Authority": mockData.authority,
            "Validity": mockData.validity,
            "LLM Verdict": "Compliant"
          }) as unknown as Record<string, string | number>,
          fileBlobUrl: blobUrl,
        };

        setUploadedFiles((prev) => ({ ...prev, [key]: newRec }));
        setIsProcessingDoc(false);
        setActiveScanningKey(null);
        setPreviewDoc(newRec); // Automatically present the verified report modal
        
        if (onAddAuditEntry) {
          onAddAuditEntry(
            "AI OCR & LLM Extraction",
            `Simulated OCR + LLM verified ${fName} (Score: ${mockData.score}%, Cert: ${mockData.certNo}).`,
            "DOCS"
          );
        }
      }
    }, intervalTime);
  };

  // Handle local real file selection or synthetic document fill
  const handleFileUpload = (key: string, file: File | null, preset?: (typeof MANDATORY_DOCUMENTS_SCHEMA)[0]) => {
    startProcessingAnimation(key, file, preset);
  };

  const handleRemoveFile = (key: string) => {
    setUploadedFiles((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // Complete Registration Form Submission
  const handleFinalSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();

    const newAppId = `AICTE/2026/APP-${Math.floor(2100 + Math.random() * 800)}`;
    const docItems: DocumentItem[] = Object.entries(uploadedFiles).map(([id, rec]) => ({
      id: `DOC-${id.toUpperCase()}`,
      title: rec.title,
      category: rec.category,
      status: "UPLOADED",
      fileName: rec.fileName,
      fileSize: rec.fileSize,
      uploadedAt: rec.uploadedAt,
      extractedValues: rec.extractedValues,
    }));

    const newApp: ApplicationDraft = {
      applicationId: newAppId,
      type: regType,
      program: regProgram,
      targetAcademicYear: regAcademicYear,
      currentStage: "SUBMITTED",
      stepProgress: 1,
      submissionDate: new Date().toISOString().split("T")[0],
      intakeRequested: regRequestedIntake,
      existingIntake: regExistingIntake,
      slaDaysTotal: 30,
      slaDaysUsed: 0,
      deficiencies: [],
      documents: docItems,
    };

    const updated = [newApp, ...applications];
    updateApps(updated);

    onAddAuditEntry(
      "STATUTORY_APPROVAL_DOCKET_FILED",
      newAppId,
      `Institution filed ${regType} for ${regProgram} with ${docItems.length} verified statutory documents (FSR: 1:${computedFsrRatio}).`
    );

    setResponseToast(`Official Application Docket ${newAppId} filed successfully! Transferred to Technical Scrutiny.`);
    setActiveTab("applications");
    setWizardStep(1);
    setTimeout(() => setResponseToast(null), 5000);
  };

  // Resolve Deficiency Response
  const handleSubmitDeficiency = (defId: string, appId: string) => {
    if (!responseText.trim()) return;

    const updated = applications.map((app) => {
      if (app.applicationId === appId) {
        return {
          ...app,
          deficiencies: app.deficiencies.map((d) =>
            d.id === defId
              ? {
                  ...d,
                  status: "RESPONSE_SUBMITTED" as const,
                  responseExplanation: responseText,
                  rectificationDocName: rectificationFile || "Rectified_Compliance_Affidavit_2026.pdf",
                }
              : d
          ),
        };
      }
      return app;
    });

    updateApps(updated);
    setResponseText("");
    setRectificationFile(null);
    setResponseToast(`Rectification response submitted for ${defId}. Transferred to Scrutiny Desk.`);

    onAddAuditEntry(
      "DEFICIENCY_RECTIFICATION_SUBMITTED",
      appId,
      `Institution submitted rectification for ${defId} with uploaded compliance proof.`
    );
    setTimeout(() => setResponseToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {responseToast && (
        <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-base">✓</span>
            <span>{responseToast}</span>
          </div>
          <button
            onClick={() => setResponseToast(null)}
            className="text-emerald-600 hover:text-emerald-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* College Profile Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 pt-7 sm:pt-9 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-0.5 rounded-full dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300">
              Institution Portal • Applicant Desk
            </span>
            <span className="text-xs text-slate-500 font-mono font-semibold dark:text-slate-400">
              Code: {MOCK_INSTITUTION_PROFILE.code}
            </span>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-full dark:bg-emerald-950/80 dark:border-emerald-800 dark:text-emerald-300">
              AY 2026-27 Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {MOCK_INSTITUTION_PROFILE.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">
            {MOCK_INSTITUTION_PROFILE.trustName} • {MOCK_INSTITUTION_PROFILE.region} Region • {MOCK_INSTITUTION_PROFILE.accreditation}
          </p>
        </div>

        {/* Primary Call to Action: File New Registration */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => {
              setActiveTab("new_approval");
              setWizardStep(1);
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
          >
            <span className="text-base leading-none">＋</span>
            <span>Register New Approval / EoA</span>
          </button>
        </div>
      </div>

      {/* Modern Sub-Tab Navigation (AICTE Web Portal Flow) */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-5 text-xs sm:text-sm font-semibold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("applications")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === "applications"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <span>📁</span>
          <span>Submitted Dockets & EoA ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("new_approval")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === "new_approval"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <span>✍️</span>
          <span>New Approval Registration & Files</span>
        </button>
        <button
          onClick={() => setActiveTab("deficiencies")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === "deficiencies"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <span>⚠️</span>
          <span>Deficiency Notice Inbox</span>
          {applications.some((a) => a.deficiencies.some((d) => d.status === "OPEN")) && (
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === "payments"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <span>💳</span>
          <span>Regulatory Fees & Payments</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === "profile"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <span>🏛️</span>
          <span>Institution & Trust Details</span>
        </button>
        <button
          onClick={() => setActiveTab("self_check")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === "self_check"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <span>⚖️</span>
          <span>AICTE APH 2026-27 Self-Check</span>
        </button>
        <button
          onClick={() => setActiveTab("vault")}
          className={`pb-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
            activeTab === "vault"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400"
          }`}
        >
          <span>📜</span>
          <span>Statutory Document Vault & DigiLocker</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SUBMITTED APPLICATIONS LIST */}
      {/* ========================================================================= */}
      {activeTab === "applications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Active Regulatory Dockets & Multi-Stage Progression
            </h2>
            <span className="text-xs text-slate-500">
              Total {applications.length} dockets tracked
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {applications.map((app) => {
              const openDefs = app.deficiencies.filter((d) => d.status === "OPEN");
              const hasDeficiencies = openDefs.length > 0;

              return (
                <div
                  key={app.applicationId}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all space-y-4"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                          {app.applicationId}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {app.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-slate-400">AY {app.targetAcademicYear}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 pt-1">
                        {app.program}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          app.currentStage === "APPROVED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : app.currentStage === "SUBMITTED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        ● {app.currentStage.replace(/_/g, " ")}
                      </span>
                      {app.currentStage === "APPROVED" && (
                        <button
                          onClick={() => setSelectedEoaModal(app)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <span>📄</span>
                          <span>View Official EoA Letter (2026-27)</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedAppModal(app)}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
                      >
                        Inspect Docket & Files
                      </button>
                    </div>
                  </div>

                  {/* Multi-Stage Progression Timeline */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex justify-between">
                      <span>Approval Pipeline Progress</span>
                      <span>SLA: {app.slaDaysUsed} / {app.slaDaysTotal} Days Elapsed</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold">
                        ✓ 1. Submission
                      </div>
                      <div className={`p-2 rounded-lg border font-semibold ${
                        app.stepProgress >= 2
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}>
                        {app.stepProgress >= 2 ? "✓" : "○"} 2. Technical Scrutiny
                      </div>
                      <div className={`p-2 rounded-lg border font-semibold ${
                        app.stepProgress >= 3
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}>
                        {app.stepProgress >= 3 ? "✓" : "○"} 3. EVC Inspection
                      </div>
                      <div className={`p-2 rounded-lg border font-semibold ${
                        app.stepProgress >= 4
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                          : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500"
                      }`}>
                        {app.stepProgress >= 4 ? "✓" : "○"} 4. Council Order
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Chips & Uploaded Files */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>Existing Intake: <strong>{app.existingIntake}</strong></span>
                      <span>•</span>
                      <span>Requested Intake: <strong className="text-emerald-600 dark:text-emerald-400">+{app.intakeRequested}</strong></span>
                      <span>•</span>
                      <span>Statutory Files Attached: <strong>{app.documents.length} Files</strong></span>
                    </div>

                    {hasDeficiencies ? (
                      <div className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                        <span>⚠️</span>
                        <span>{openDefs.length} Deficiency Pending Rectification</span>
                        <button
                          onClick={() => setActiveTab("deficiencies")}
                          className="ml-2 text-[11px] underline font-bold cursor-pointer"
                        >
                          Resolve Now ➔
                        </button>
                      </div>
                    ) : (
                      <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <span>✓</span>
                        <span>No Open Deficiencies</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REGISTER NEW APPROVAL WITH INTEGRATED FILE UPLOADER */}
      {/* ========================================================================= */}
      {activeTab === "new_approval" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Official AICTE Approval Registration Form (AY 2026-27)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Mandatory statutory application for New Courses, Increase in Intake & Extension of Approval.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              Step {wizardStep} of 4
            </div>
          </div>

          {/* Wizard Step Progress Pills */}
          <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
            <button
              onClick={() => setWizardStep(1)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                wizardStep === 1
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              1. Program & Intake
            </button>
            <button
              onClick={() => setWizardStep(2)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                wizardStep === 2
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              2. Built-Up & Infra
            </button>
            <button
              onClick={() => setWizardStep(3)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                wizardStep === 3
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              3. Faculty Cadre & FSR
            </button>
            <button
              onClick={() => setWizardStep(4)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                wizardStep === 4
                  ? "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold"
                  : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-500"
              }`}
            >
              4. Statutory Files ({Object.keys(uploadedFiles).length}/6)
            </button>
          </div>

          <form onSubmit={handleFinalSubmitRegistration} className="space-y-6 pt-2">
            {/* STEP 1: PROGRAM & INTAKE PARTICULARS */}
            {wizardStep === 1 && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Application Category
                    </label>
                    <select
                      value={regType}
                      onChange={(e) => setRegType(e.target.value as ApplicationDraft["type"])}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="NEW_COURSE">Introduction of New Emerging Area Course</option>
                      <option value="INCREASE_INTAKE">Increase in Intake in Existing Course</option>
                      <option value="EXTENSION_OF_APPROVAL">Extension of Approval (EoA 2026-27)</option>
                      <option value="NEW_INSTITUTE">Establishment of New Technical Institute</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Target Academic Session
                    </label>
                    <input
                      type="text"
                      value={regAcademicYear}
                      onChange={(e) => setRegAcademicYear(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Discipline / Program Level
                    </label>
                    <select
                      value={regCategory}
                      onChange={(e) => setRegCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Engineering & Technology (UG)">Engineering & Technology (Undergraduate B.Tech)</option>
                      <option value="Engineering & Technology (PG)">Engineering & Technology (Postgraduate M.Tech)</option>
                      <option value="Management (MBA/PGDM)">Management (MBA / PGDM)</option>
                      <option value="Computer Applications (MCA)">Computer Applications (MCA)</option>
                      <option value="Applied Arts & Design">Applied Arts, Crafts & Design</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Proposed Course / Specialization Title
                    </label>
                    <input
                      type="text"
                      value={regProgram}
                      onChange={(e) => setRegProgram(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science & Engineering"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Existing Approved Intake
                    </label>
                    <input
                      type="number"
                      value={regExistingIntake}
                      onChange={(e) => setRegExistingIntake(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Additional Intake Requested (Seats)
                    </label>
                    <input
                      type="number"
                      step={30}
                      value={regRequestedIntake}
                      onChange={(e) => setRegRequestedIntake(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Next: Built-Up & Infrastructure ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BUILT-UP & INFRASTRUCTURE */}
            {wizardStep === 2 && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                  <div className="font-bold">AICTE Land & Carpet Area Standard Norms:</div>
                  <div>Minimum instructional area required for 540 intake: 12,000 sq.m. Classrooms: min 18.</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Total Instructional Built-Up Area (sq.m)
                    </label>
                    <input
                      type="number"
                      value={regBuiltupArea}
                      onChange={(e) => setRegBuiltupArea(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Available Classrooms (Smart/Tech-Enabled)
                    </label>
                    <input
                      type="number"
                      value={regClassrooms}
                      onChange={(e) => setRegClassrooms(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Specialized Research & Computer Labs
                    </label>
                    <input
                      type="number"
                      value={regLabs}
                      onChange={(e) => setRegLabs(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    ⬅ Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Next: Faculty Cadre & FSR Engine ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: FACULTY CADRE & LIVE FSR ENGINE */}
            {wizardStep === 3 && (
              <div className="space-y-5">
                {/* Live FSR Pre-Check Card */}
                <div
                  className={`p-5 rounded-2xl border ${
                    isFsrCompliant
                      ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{isFsrCompliant ? "✅" : "⚠️"}</span>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          AICTE Live Faculty-to-Student Ratio (FSR) Evaluation
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          Statutory requirement: 1:20 (Engineering UG). Total Students: {totalStudents} • Total Faculty: {totalFaculty}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono font-extrabold text-slate-900 dark:text-slate-100">
                        1 : {computedFsrRatio}
                      </div>
                      <div
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isFsrCompliant ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {isFsrCompliant ? "Compliant with AICTE Norms" : "Shortfall in Cadre Norm"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Professors (Cadre 1)
                    </label>
                    <input
                      type="number"
                      value={regProfessors}
                      onChange={(e) => setRegProfessors(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Associate Professors (Cadre 2)
                    </label>
                    <input
                      type="number"
                      value={regAssocProfessors}
                      onChange={(e) => setRegAssocProfessors(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Assistant Professors (Cadre 3)
                    </label>
                    <input
                      type="number"
                      value={regAsstProfessors}
                      onChange={(e) => setRegAsstProfessors(parseInt(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    ⬅ Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Next: Upload Mandatory Statutory Files ➔
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: MANDATORY STATUTORY FILE UPLOADING SYSTEM */}
            {wizardStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Mandatory Statutory Document Uploads (6 Key Verification Instruments)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Upload scanned PDF instruments. You can select actual local files or use verified synthetic documents.
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {Object.keys(uploadedFiles).length} of 6 Attached
                  </span>
                </div>

                {/* Upload Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MANDATORY_DOCUMENTS_SCHEMA.map((docSchema) => {
                    const isAttached = Boolean(uploadedFiles[docSchema.key]);
                    const attachedData = uploadedFiles[docSchema.key];

                    return (
                      <div
                        key={docSchema.key}
                        className={`rounded-2xl border p-4.5 space-y-3 transition-all ${
                          isAttached
                            ? "bg-slate-50/70 dark:bg-slate-800/40 border-emerald-400 dark:border-emerald-800"
                            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              {docSchema.category} Instrument
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                              {docSchema.title}
                            </h4>
                          </div>
                          {isAttached ? (
                            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              ✓ Attached
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {docSchema.description}
                        </p>

                        {/* File Upload Zone / Attached Preview */}
                        {isAttached ? (
                          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <div className="flex items-center gap-2 truncate">
                                <span className="text-red-500">📄</span>
                                <span className="truncate text-slate-800 dark:text-slate-200">
                                  {attachedData.fileName}
                                </span>
                              </div>
                              <span className="text-slate-400 text-[11px] shrink-0 font-mono">
                                {attachedData.fileSize}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-1.5">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                AI OCR Confidence: {attachedData.ocrConfidence}%
                              </span>
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(attachedData)}
                                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                                >
                                  View Instrument
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(docSchema.key)}
                                  className="text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Drag and drop / local file selector */}
                            <label className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 flex flex-col items-center justify-center text-center transition-colors bg-slate-50/50 dark:bg-slate-800/30 ${
                              isProcessingDoc ? 'opacity-50 cursor-not-allowed' : 'hover:border-emerald-500 cursor-pointer'
                            }`}>
                              <span className="text-base">📤</span>
                              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-1">
                                {isProcessingDoc ? 'Processing in progress...' : 'Click to browse PDF file'}
                              </span>
                              <span className="text-[10px] text-slate-400">PDF, max 15MB</span>
                              <input
                                type="file"
                                accept=".pdf,.xlsx,.csv,.docx"
                                disabled={isProcessingDoc}
                                className="hidden"
                                onChange={(e) => {
                                  if (isProcessingDoc) return;
                                  if (e.target.files && e.target.files[0]) {
                                    handleFileUpload(docSchema.key, e.target.files[0], docSchema);
                                  }
                                }}
                              />
                            </label>

                            {/* One-click Synthetic Document Pre-Fill */}
                            <button
                              type="button"
                              disabled={isProcessingDoc}
                              onClick={() => {
                                if (isProcessingDoc) return;
                                handleFileUpload(docSchema.key, null, docSchema);
                              }}
                              className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                                isProcessingDoc
                                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                  : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 cursor-pointer'
                              }`}
                            >
                              <span>⚡</span>
                              <span>{isProcessingDoc ? 'Processing Document...' : 'Use Verified AICTE Synthetic Document'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Final Submission Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <input type="checkbox" defaultChecked required className="mt-0.5 rounded cursor-pointer" />
                    <span>
                      I, as the authorized Head of Institution, solemnly affirm that all particulars declared above and the
                      uploaded statutory certificates are authentic and legally binding under the AICTE Act 1987.
                    </span>
                  </label>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    ⬅ Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <span>🚀 Submit Official Application Docket</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DEFICIENCY NOTICES & RECTIFICATION UPLOADER */}
      {/* ========================================================================= */}
      {activeTab === "deficiencies" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Statutory Deficiency Notices & Show-Cause Communication Inbox
            </h2>
          </div>

          <div className="space-y-4">
            {applications.flatMap((app) =>
              app.deficiencies.map((def) => {
                const isOpen = def.status === "OPEN";
                return (
                  <div
                    key={def.id}
                    className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 ${
                      isOpen
                        ? "border-amber-300 dark:border-amber-800"
                        : "border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400">
                            {def.id}
                          </span>
                          <span className="text-xs text-slate-500">Docket: {app.applicationId}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 pt-0.5">
                          {def.ruleCode}
                        </h3>
                      </div>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          isOpen
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        {def.status.replace(/_/g, " ")}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {def.description}
                    </p>

                    <div className="text-[11px] text-slate-500 flex flex-wrap gap-4">
                      <span>Raised By: <strong>{def.raisedBy}</strong></span>
                      <span>•</span>
                      <span>SLA Due Date: <strong>{def.dueAt}</strong></span>
                    </div>

                    {/* Rectification Response Form if Open */}
                    {isOpen ? (
                      <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 space-y-3">
                        <label className="block text-xs font-bold text-amber-900 dark:text-amber-300">
                          Submit Formal Compliance Response & Supporting Rectification Document:
                        </label>
                        <textarea
                          rows={3}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Provide statutory factual explanation and refer to uploaded appointment orders/NOCs..."
                          className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                        />

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setRectificationFile("CSE_Faculty_Appointment_Orders_Batch_2026.pdf")}
                            className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer hover:bg-slate-100"
                          >
                            📎 {rectificationFile ? `Attached: ${rectificationFile}` : "Attach Rectification Proof (PDF)"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSubmitDeficiency(def.id, app.applicationId)}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                          >
                            Submit Rectification to Scrutiny Desk
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                        <div className="font-bold">✓ Response Submitted:</div>
                        <div>"{def.responseExplanation}"</div>
                        {def.rectificationDocName && (
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            Attached Instrument: {def.rectificationDocName}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SELF CHECK SIMULATOR */}
      {/* ========================================================================= */}
      {activeTab === "self_check" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              AICTE Approval Process Handbook (APH 2026-27) Self-Check Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic verification against current AICTE statutory rulebook clauses prior to official filing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_SELF_CHECK_RULES.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {rule.id}
                    </span>
                    <span className="text-[10px] text-slate-400">({rule.category})</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rule.compliant
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    }`}
                  >
                    {rule.compliant ? "PASS" : "DEFICIT / ATTENTION"}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {rule.requirement}
                </h4>
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  Institution Declared: <strong>{rule.institutionValue}</strong>
                </div>
                <div className="text-[10px] text-slate-400">
                  Severity: <span className="font-semibold">{rule.severity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: STATUTORY DOCUMENT VAULT */}
      {/* ========================================================================= */}
      {activeTab === "vault" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Institutional Statutory Document Vault
              </h2>
              <p className="text-xs text-slate-500">
                Centralized vault of official land, safety, and faculty instruments with validity monitoring.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(uploadedFiles).map(([key, f]) => (
              <div
                key={key}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {f.category}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    VERIFIED
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {f.title}
                </h4>
                <div className="text-xs font-mono text-slate-500 truncate">
                  📄 {f.fileName} ({f.fileSize})
                </div>
                {f.extractedValues && (
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                    {Object.entries(f.extractedValues).map(([k, v]) => (
                      <span key={k} className="mr-3">
                        {k}: <strong>{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                )}
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(f)}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>👁️</span>
                    <span>View Verified Instrument</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: INSTITUTION & TRUST DETAILS (AICTE WEB PORTAL MODEL) */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  AICTE Web Portal: Institution Details & Statutory Records
                </h2>
                <p className="text-xs text-slate-500">
                  Permanent Council records synchronized with National Single Window System (NSWS) and AISHE.
                </p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                AICTE Permanent ID: 1-10493821
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Institution Name</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">{MOCK_INSTITUTION_PROFILE.name}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Affiliating University</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">Delhi Technological University (DTU)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Year of Establishment</span>
                <div className="font-bold text-slate-900 dark:text-slate-100">2004 (22 Years of Standing)</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">AISHE National Code</span>
                <div className="font-bold text-slate-900 dark:text-slate-100 font-mono">C-18920 (Ministry of Education)</div>
              </div>
            </div>

            {/* Sponsoring Trust / Society Particulars */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Trust / Sponsoring Organization Details (Societies Registration Act XXI 1860)
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  ✓ Perpetual Clear Title
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Registered Trust Name:</span>
                  <strong className="text-slate-800 dark:text-slate-200">{MOCK_INSTITUTION_PROFILE.trustName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Registration / Trust Deed No:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">S-38910/2004 (Sub-Registrar Delhi)</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">Registered Trust Address:</span>
                  <span className="text-slate-700 dark:text-slate-300">Institutional Area, Sector 12, New Delhi</span>
                </div>
              </div>
            </div>

            {/* National Accreditations & Rankings (NBA, NAAC, NIRF) */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-3 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  National Accreditation & Ranking Status (Cross-Record Signals)
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  ✓ Verified by ACAS API
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">NBA Accreditation</div>
                  <div className="font-bold text-emerald-600 text-sm">Tier-1 Accredited (CSE & ECE)</div>
                  <div className="text-[10px] text-slate-500">Valid through 30-June-2027</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">NAAC Accreditation</div>
                  <div className="font-bold text-emerald-600 text-sm">Grade A++ (CGPA: 3.65)</div>
                  <div className="text-[10px] text-slate-500">Cycle-2 National Assessment</div>
                </div>
                <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400">NIRF National Ranking</div>
                  <div className="font-bold text-emerald-600 text-sm">Rank Band 101-150 (Engg)</div>
                  <div className="text-[10px] text-slate-500">Ministry of Education 2025</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: STATUTORY PAYMENTS TAB (AICTE WEB PORTAL & BHARATKOSH MODEL) */}
      {/* ========================================================================= */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  AICTE Regulatory Fees & Bharatkosh Payment Verification
                </h2>
                <p className="text-xs text-slate-500">
                  Statutory fee reconciliation under Approval Process Handbook (APH 2026-27 Chapter 1, Clause 1.4).
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ Reconciled with Public Financial Management System (PFMS)
              </span>
            </div>

            {/* Fee Schedule Table */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3.5">Fee Category & Head</th>
                    <th className="p-3.5">Statutory Reference</th>
                    <th className="p-3.5">Academic Session</th>
                    <th className="p-3.5 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                      Extension of Approval (EoA) Regulatory Processing Fee
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono">APH 2026-27 App. 1.2</td>
                    <td className="p-3.5 text-slate-500">AY 2026-27</td>
                    <td className="p-3.5 text-right font-mono font-bold">₹ 1,00,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                      Technical Education Regulatory (TER) Charges
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono">APH 2026-27 App. 1.3</td>
                    <td className="p-3.5 text-slate-500">AY 2026-27</td>
                    <td className="p-3.5 text-right font-mono font-bold">₹ 50,000.00</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      Late Application Surcharge (Before 31-March-2026)
                    </td>
                    <td className="p-3.5 text-slate-400 font-mono">Clause 1.4.3</td>
                    <td className="p-3.5 text-emerald-600 font-bold">Exempt (Timely Filing)</td>
                    <td className="p-3.5 text-right font-mono text-emerald-600 font-bold">₹ 0.00</td>
                  </tr>
                  <tr className="bg-slate-50/70 dark:bg-slate-800/40 font-bold text-sm">
                    <td colSpan={3} className="p-3.5 text-right">Total Fee Payable:</td>
                    <td className="p-3.5 text-right font-mono text-emerald-700 dark:text-emerald-400">₹ 1,50,000.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Payment Challan Details Box */}
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
              <div className="space-y-1">
                <div className="font-extrabold text-sm text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                  <span>✓</span>
                  <span>Payment Successfully Verified & Recorded in Central Treasury</span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Bharatkosh Challan No: <strong className="font-mono text-slate-900 dark:text-slate-100">BK-2026-AICTE-88914</strong> • Gateway Ref: <strong className="font-mono">SBIE-7729104829</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  Transaction Date: <strong>14-Jan-2026, 11:42:18 IST</strong> • Bank Reference: State Bank of India (Treasury Branch)
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert("Official Bharatkosh Treasury Receipt PDF generated.")}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer shrink-0"
              >
                Download Bharatkosh Receipt 📄
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSPECTION MODAL FOR APPLICATION DOCKET & FILES */}
      {/* ========================================================================= */}
      {selectedAppModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400">
                  {selectedAppModal.applicationId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedAppModal.program}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAppModal(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedAppModal.type}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Session</span>
                <strong className="text-slate-800 dark:text-slate-200">{selectedAppModal.targetAcademicYear}</strong>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Requested Seats</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono">+{selectedAppModal.intakeRequested}</strong>
              </div>
            </div>

            {/* Attached Statutory Files */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Attached Statutory Instruments ({selectedAppModal.documents.length} Files)
              </h4>
              <div className="space-y-1.5">
                {selectedAppModal.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span>📄</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {doc.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-mono text-slate-400">
                        {doc.fileSize}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewDoc({
                            title: doc.title,
                            fileName: doc.fileName,
                            fileSize: doc.fileSize,
                            category: doc.category,
                            extractedValues: doc.extractedValues,
                            ocrConfidence: 99.2,
                          })
                        }
                        className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-xs cursor-pointer"
                      >
                        Preview File
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedAppModal(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL 2026-27 EXTENSION OF APPROVAL (EOA) REPORT MODAL */}
      {/* ========================================================================= */}
      {selectedEoaModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 border-4 border-slate-300">
            {/* Top Close and Print Bar */}
            <div className="flex items-center justify-between border-b pb-3 text-xs">
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                AICTE Official Gazette Order AY 2026-27
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                >
                  🖨️ Print EoA Order
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedEoaModal(null)}
                  className="text-slate-400 hover:text-slate-800 text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Official AICTE Letterhead Header */}
            <div className="text-center space-y-1.5 border-b-2 border-slate-900 pb-4">
              <div className="text-2xl">🏛️</div>
              <h2 className="font-extrabold text-lg uppercase tracking-tight text-slate-950 font-serif">
                All India Council for Technical Education
              </h2>
              <p className="text-[11px] font-semibold text-slate-600">
                (A Statutory Body of the Government of India, Ministry of Education)
              </p>
              <p className="text-[10px] text-slate-500">
                Nelson Mandela Marg, Vasant Kunj, New Delhi-110070 • Website: www.aicte.gov.in
              </p>
            </div>

            {/* Reference Number & Date */}
            <div className="flex justify-between items-start text-xs font-mono">
              <div>
                <strong>F.No. Northern/1-10493821/2026/EOA</strong>
              </div>
              <div className="text-right">
                <div>Date: <strong>30-Apr-2026</strong></div>
              </div>
            </div>

            {/* Addressee */}
            <div className="text-xs space-y-1">
              <div>To,</div>
              <div className="font-semibold">The Principal Secretary (Technical Education),</div>
              <div>Govt. of NCT of Delhi, Vikas Bhawan, New Delhi - 110002.</div>
            </div>

            {/* Subject */}
            <div className="text-xs leading-relaxed bg-slate-50 p-3 rounded-lg border font-medium">
              <strong>Sub: Extension of Approval (EoA) for Academic Year 2026-27</strong><br />
              Ref: Application of the Institution for Extension of Approval / New Courses for Academic Year 2026-27.
            </div>

            <p className="text-xs leading-relaxed">
              Sir/Madam, In terms of the provisions under the All India Council for Technical Education (Grant of Approvals for Technical Institutions) Regulations, 2026 notified by the Council vide notification number F.No. AB/AICTE/REG/2026 and standards prescribed by the Council from time to time, I am directed to convey the approval to:
            </p>

            {/* Institute Identification Table */}
            <table className="w-full text-xs border border-slate-300">
              <tbody>
                <tr className="border-b">
                  <td className="p-2 font-bold bg-slate-50 w-1/3">Permanent Institute ID:</td>
                  <td className="p-2 font-mono">1-10493821</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-bold bg-slate-50">Name of the Institution:</td>
                  <td className="p-2 font-bold">{MOCK_INSTITUTION_PROFILE.name}</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-bold bg-slate-50">Institution Address:</td>
                  <td className="p-2">Plot No. 14, Knowledge Park, Delhi NCR - 110092</td>
                </tr>
                <tr className="border-b">
                  <td className="p-2 font-bold bg-slate-50">Name of Sponsoring Trust:</td>
                  <td className="p-2">{MOCK_INSTITUTION_PROFILE.trustName}</td>
                </tr>
                <tr>
                  <td className="p-2 font-bold bg-slate-50">Affiliating University:</td>
                  <td className="p-2">Delhi Technological University (DTU)</td>
                </tr>
              </tbody>
            </table>

            {/* Approved Programs & Intake Table */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wide">
                To conduct following Programs / Courses with Intake indicated below for Academic Year 2026-27:
              </h4>
              <table className="w-full text-xs border border-slate-300 text-left">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2">Level</th>
                    <th className="p-2">Program</th>
                    <th className="p-2">Course Name</th>
                    <th className="p-2 text-right">Intake 2025-26</th>
                    <th className="p-2 text-right">Approved 2026-27</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2">UNDER GRADUATE</td>
                    <td className="p-2">ENGINEERING & TECH</td>
                    <td className="p-2 font-bold">COMPUTER SCIENCE & ENGINEERING</td>
                    <td className="p-2 text-right">180</td>
                    <td className="p-2 text-right font-bold">180</td>
                    <td className="p-2 text-center text-emerald-700 font-bold">APPROVED</td>
                  </tr>
                  <tr>
                    <td className="p-2">UNDER GRADUATE</td>
                    <td className="p-2">ENGINEERING & TECH</td>
                    <td className="p-2 font-bold">ARTIFICIAL INTELLIGENCE & DATA SCIENCE</td>
                    <td className="p-2 text-right">0</td>
                    <td className="p-2 text-right font-bold text-emerald-700">60 (NEW)</td>
                    <td className="p-2 text-center text-emerald-700 font-bold">APPROVED</td>
                  </tr>
                  <tr>
                    <td className="p-2">UNDER GRADUATE</td>
                    <td className="p-2">ENGINEERING & TECH</td>
                    <td className="p-2 font-bold">ELECTRONICS & COMMUNICATION ENGG</td>
                    <td className="p-2 text-right">120</td>
                    <td className="p-2 text-right font-bold">120</td>
                    <td className="p-2 text-center text-emerald-700 font-bold">APPROVED</td>
                  </tr>
                  <tr>
                    <td className="p-2">UNDER GRADUATE</td>
                    <td className="p-2">ENGINEERING & TECH</td>
                    <td className="p-2 font-bold">MECHANICAL ENGINEERING</td>
                    <td className="p-2 text-right">60</td>
                    <td className="p-2 text-right font-bold">60</td>
                    <td className="p-2 text-center text-emerald-700 font-bold">APPROVED</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td colSpan={4} className="p-2 text-right">Total Approved Intake:</td>
                    <td className="p-2 text-right font-mono text-emerald-700">420</td>
                    <td className="p-2 text-center text-emerald-700">VALID</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Mandatory Facilities Compliance Section matching 2026-27 EoA format */}
            <div className="space-y-2 border-t pt-3">
              <h4 className="text-xs font-bold uppercase tracking-wide">
                Mandatory Facilities & Deficiency Assessment (AY 2026-27):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                  <div className="font-bold text-slate-800">1. Library Facilities Norms:</div>
                  <div className="text-[11px] text-slate-600">Total Volumes: <strong>14,800</strong> (Req: 12,000) • ✓ PASS</div>
                  <div className="text-[11px] text-slate-600">National Journals: <strong>52</strong> (Req: 48) • ✓ PASS</div>
                  <div className="text-[11px] text-slate-600">Digital Library & NDLI: <strong>Subscribed</strong> • ✓ PASS</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border space-y-1">
                  <div className="font-bold text-slate-800">2. Other Facilities & Safety:</div>
                  <div className="text-[11px] text-slate-600">Barrier-Free Accessibility: <strong>Compliant Ramps & Lifts</strong></div>
                  <div className="text-[11px] text-slate-600">Fire Safety NOC: <strong>Valid till 2027</strong></div>
                  <div className="text-[11px] text-slate-600">Deficiency Status: <strong className="text-emerald-700">NO DEFICIENCY RECORDED</strong></div>
                </div>
              </div>
            </div>

            {/* Official Council Sign-Off Seal */}
            <div className="border-t pt-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 border-2 border-slate-900 rounded-lg flex flex-col items-center justify-center font-mono text-[9px] p-1 text-center bg-slate-50">
                  <span>[QR CODE]</span>
                  <span className="font-bold">VERIFIED</span>
                  <span>AICTE SETU</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Digitally Authenticated by Council DSC<br />
                  Certificate Serial: <span className="font-mono">DSC-AICTE-ND-2026-88194</span>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="font-bold text-slate-900">Prof. Rajive Kumar</div>
                <div className="text-[11px] text-slate-600">Member Secretary</div>
                <div className="text-[10px] text-slate-500">All India Council for Technical Education</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SIMULATED OCR + LLM DOCUMENT PROCESSING PIPELINE (5-6 SECONDS) */}
      {/* ========================================================================= */}
      {isProcessingDoc && stagedDocForProcess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden">
            
            {/* Header Badge & Demo Mode Label */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
                  ⚡
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Document AI & LLM Engine</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Autonomous Statutory Extraction & Compliance Checks
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-extrabold tracking-wider uppercase">
                Demo Mode • Simulated AI Processing
              </span>
            </div>

            {/* Document Hologram / Scan Line Area */}
            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-5 overflow-hidden shadow-inner text-slate-100 space-y-3.5">
              {/* Dynamic Scan Line Effect */}
              <div className="absolute inset-x-0 h-1 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-scanline pointer-events-none z-20"></div>

              {/* Watermark Grid Background */}
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none"></div>

              {/* File details & Percentage */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                    📄
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-slate-100 truncate">
                      {stagedDocForProcess.fileName}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{stagedDocForProcess.fileSize}</span>
                      <span>•</span>
                      <span>Encrypted Document Stream</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight tabular-nums">
                    {scanProgress}%
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Progress</div>
                </div>
              </div>

              {/* Glowing Real-time Progress Bar */}
              <div className="relative z-10 w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-linear-to-r from-emerald-500 via-teal-400 to-emerald-400 h-2.5 rounded-full transition-all duration-75 shadow-[0_0_8px_#10b981]"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Sequential Step Timeline (6-Stage Verification Pipeline) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                <span>Verification Pipeline</span>
                <span className="text-emerald-600 dark:text-emerald-400">Step {scanStepIndex + 1} of 6</span>
              </div>
              <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 text-xs">
                {SCAN_STEPS.map((step, idx) => {
                  const isDone = idx < scanStepIndex;
                  const isCurrent = idx === scanStepIndex;

                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 p-2 rounded-xl transition-all duration-200 ${
                        isCurrent
                          ? "bg-white dark:bg-slate-800 shadow-xs border border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
                          : isDone
                          ? "text-slate-700 dark:text-slate-300 opacity-80"
                          : "text-slate-400 opacity-40"
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        {isDone ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                            ✓
                          </div>
                        ) : isCurrent ? (
                          <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[9px] font-semibold">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-xs leading-tight ${isCurrent ? "text-emerald-600 dark:text-emerald-400 font-bold" : ""}`}>
                          {step.title}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate pt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center text-[11px] text-slate-400 font-medium">
              Simulated AI processing pipeline executing optical character extraction and statutory validation.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* HIGH-FIDELITY STATUTORY DOCUMENT PREVIEW & OCR DETAIL MODAL */}
      {/* ========================================================================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-lg">
                  📑
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {previewDoc.title}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-400">
                    {previewDoc.fileName} • {previewDoc.fileSize || "4.2 MB"}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Verification Report Sheet */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-5 bg-linear-to-b from-slate-50 via-white to-slate-50 dark:from-slate-800/40 dark:via-slate-800/20 dark:to-slate-800/40 space-y-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-extrabold">
                  <span>✓</span> Simulated AI Verification Report
                </span>
                <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-800">
                  Demo Mode
                </span>
              </div>

              {/* Primary Predefined Extracted Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Certificate Number</div>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-100 text-xs pt-0.5 truncate">
                    {previewDoc.certificateNumber || "DFS/HQ/2026/F-NOC-449"}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Issuing Statutory Authority</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-xs pt-0.5 truncate">
                    {previewDoc.issuingAuthority || "Competent Statutory Authority"}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Institution Name Recognized</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-xs pt-0.5 truncate">
                    {previewDoc.institutionName || "Delhi Institute of Engineering & Technology"}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Validity Period / Expiry</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs pt-0.5 truncate">
                    {previewDoc.validityDate || "AY 2026-2027 (Active Valid)"}
                  </div>
                </div>
              </div>

              {/* Validation Findings & LLM Verification Checklist */}
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span>LLM Statutory Validation Findings:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Passed</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                  {(previewDoc.validationFindings || [
                    "Statutory clauses and digital signatures cross-verified against Approval Process Handbook 2026-27.",
                    "Mandatory institutional carpet area, safety provisions, and governance criteria satisfied.",
                    "Document cryptographic hash authenticated without tampering or procedural omissions."
                  ]).map((finding: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-1 border-t border-slate-200 dark:border-slate-700 font-mono">
                Verification Ledger: <strong>SHA-256 (Simulated Integrity Certified)</strong> • AICTE SETU v3.0
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Confidence: {previewDoc.ocrConfidence || 99.2}%
              </span>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
