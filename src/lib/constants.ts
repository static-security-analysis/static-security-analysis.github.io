export type Language =
  | "JavaScript"
  | "TypeScript"
  | "Python"
  | "Java"
  | "C"
  | "C++"
  | "C#"
  | "Go"
  | "Ruby"
  | "PHP"
  | "Rust"
  | "Swift"
  | "Kotlin"
  | "Scala"
  | "Groovy"
  | "Perl"
  | "Objective-C"
  | "Solidity"
  | "Vyper"
  | "Dart"
  | "Lua"
  | "Elixir"
  | "Erlang"
  | "Haskell"
  | "Fortran"
  | "COBOL"
  | "Ada"
  | "Pascal/Delphi"
  | "ABAP"
  | "Apex"
  | "Visual Basic"
  | "PowerShell"
  | "SQL"
  | "HTML"
  | "XML"
  | "ASP.NET"
  | "Binary"
  | "Bytecode"
  | "Infrastructure as Code"
  | "Multiple";

export type License = "Open Source" | "Commercial" | "Freemium";

export type ReferenceType =
  | "Academic Paper"
  | "White Paper"
  | "Blog Post"
  | "Tool Documentation";

export type WeaknessCategory = 
  | "Input Validation and Representation" 
  | "API Abuse" 
  | "Security Features" 
  | "Time and State" 
  | "Error Handling" 
  | "Code Quality" 
  | "Encapsulation" 
  | "Environment";

export interface Weakness {
  category: WeaknessCategory;
  examples: string[];
}

export interface AcademicReference {
  title: string;
  authors: string[];
  year: number;
  link: string;
  publication?: string;
  doi?: string;
  type: ReferenceType;
}

export interface StaticAnalyzer {
  id: string;
  name: string;
  description: string;
  languages: Language[];
  license: License;
  /** Concrete license when license === "Open Source" (e.g. "Apache-2.0", "MIT", "GPL-3.0") */
  licenseDetail?: string;
  website: string;
  github?: string;
  features: string[];
  integration: string[];
  academicReferences?: AcademicReference[];
  weaknesses?: Weakness[];
  /** Optional CWE IDs the tool can detect (e.g. ["CWE-79", "CWE-89"]) */
  cweIds?: string[];
  /** Optional pricing info (e.g. "Free", "Contact for quote", "$99/year") */
  price?: string;
  /** Optional list of supported languages for detail page (when languages includes "Multiple") */
  languagesDetail?: Language[];

  // ---- Survey catalogue metadata (from the ACMSUR SLR) ----
  /** Analysis technique families (e.g. "Taint Analysis", "Abstract Interpretation"). */
  techniques?: string[];
  /** Whether the analyzer provides soundness guarantees. */
  soundness?: "Sound" | "Unsound";
  /** Maintenance status inferred from last commit / project activity. */
  maintenance?: "Active" | "Dormant" | "Stale";
  /** Whether the tool reports empirical validation (benchmarks / real-world CVEs). */
  empiricalValidation?: boolean;
  /** Year the tool was first introduced. */
  yearIntroduced?: number;
  /** GitHub stars, when the tool has a public repository. */
  githubStars?: number;
  /** Provenance of the tool: open-source, academic prototype, or commercial. */
  toolType?: "oss" | "academic" | "commercial";
  /** Primary analysis inputs (e.g. "Source Code", "Binary", "Manifest file"). */
  input?: string[];
  /** Target ecosystems / domains (e.g. "Web", "IoT/Firmware", "Cryptography"). */
  ecosystem?: string[];
  /** Producing institute or company. */
  institute?: string;
}

// NOTE:
// The concrete StaticAnalyzer data is now provided by YAML files
// and loaded via src/lib/analyzers-loader.ts. This file only
// defines the shared types and helper vocabularies.

export const languages: Language[] = [
  "C",
  "C++",
  "Java",
  "JavaScript",
  "TypeScript",
  "Python",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  "Scala",
  "Objective-C",
  "Perl",
  "Groovy",
  "Solidity",
  "Apex",
  "Visual Basic",
  "SQL",
  "HTML",
  "Binary",
  "Bytecode",
  "Infrastructure as Code",
  "Multiple",
];

export const licenses: License[] = [
  "Open Source",
  "Commercial",
  "Freemium"
];

/** Concrete open-source license types used in filters (e.g. Apache-2.0, MIT). */
export const openSourceLicenseTypes: readonly string[] = [
  "Apache-2.0",
  "MIT",
  "GPL-3.0",
  "LGPL-2.1",
  "BSD-3-Clause",
];

/** All license filter options: main license + open-source types. */
export const licenseFilterOptions: readonly string[] = [
  ...licenses,
  ...openSourceLicenseTypes,
];

/** Tool provenance (origin) filter values, mapped from the survey `type` field. */
export const toolTypes = ["oss", "academic", "commercial"] as const;
export type ToolType = (typeof toolTypes)[number];
export const toolTypeLabel: Record<ToolType, string> = {
  oss: "Open Source",
  academic: "Academic",
  commercial: "Commercial",
};

/** Soundness filter values. */
export const soundnessValues = ["Sound", "Unsound"] as const;
export type SoundnessValue = (typeof soundnessValues)[number];

/** Maintenance-status filter values. */
export const maintenanceValues = ["Active", "Dormant", "Stale"] as const;
export type MaintenanceValue = (typeof maintenanceValues)[number];

/** Analysis technique families used by the Technique filter. */
export const techniqueFamilies: string[] = [
  "Pattern Matching",
  "Data-flow Analysis",
  "Taint Analysis",
  "Control-flow Analysis",
  "Pointer / Alias Analysis",
  "Abstract Interpretation",
  "Model Checking",
  "Symbolic/Concolic Execution",
  "Deductive Verification",
  "Type / Type-state Analysis",
  "Software Composition Analysis",
  "Hybrid (static+dynamic)",
  "Deep Learning (non-LLM)",
  "Graph Neural Network",
  "Graph-based (CPG/PDG)",
  "LLM-based",
  "Other",
  "Unknown",
];

export const weaknessCategories: WeaknessCategory[] = [
  "Input Validation and Representation",
  "API Abuse",
  "Security Features",
  "Time and State",
  "Error Handling",
  "Code Quality",
  "Encapsulation",
  "Environment",
];

// ---- Papers (survey corpus) ----
export const paperTypes = [
  "tool",
  "method",
  "empirical",
  "survey",
  "motivation",
] as const;
export type PaperType = (typeof paperTypes)[number];
export const paperTypeLabel: Record<PaperType, string> = {
  tool: "Tool paper",
  method: "Method",
  empirical: "Empirical",
  survey: "Survey",
  motivation: "Motivation",
};

/** A primary study from the survey corpus (385 papers). */
export interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  type: PaperType;
  venue?: string;
  venueAcronym?: string;
  doi?: string;
  /** Best available link (doi.org URL, or the paper/artifact url). */
  link?: string;
  url?: string;
  arxivId?: string;
  /** Slug of the tool this paper presents (matches a StaticAnalyzer id). */
  presentsToolId?: string;
  toolName?: string;
  toolsMentioned?: string[];
  /** Catalogued tool ids this paper evaluates against (baselines). */
  comparesToolIds?: string[];
  /** Catalogued tool ids this paper mentions. */
  mentionsToolIds?: string[];
  tldr?: string;
  abstract?: string;
}

/** Reference types for documentation filter; order matches filter pills. */
export const referenceTypes: ReferenceType[] = [
  "Academic Paper",
  "White Paper",
  "Blog Post",
  "Tool Documentation",
];

/** URL slug for each reference type (used in refs= query param). */
export const refTypeToSlug: Record<ReferenceType, string> = {
  "Academic Paper": "academic",
  "White Paper": "whitepaper",
  "Blog Post": "blog",
  "Tool Documentation": "tool",
};

/** Map slug back to ReferenceType. */
export const slugToRefType: Record<string, ReferenceType> = Object.fromEntries(
  referenceTypes.map((t) => [refTypeToSlug[t], t])
) as Record<string, ReferenceType>;

/** Display label for filter pills and chips. */
export const refTypeToLabel: Record<ReferenceType, string> = {
  "Academic Paper": "Academic",
  "White Paper": "White Papers",
  "Blog Post": "Blog",
  "Tool Documentation": "Tool Documentation",
};
