export interface ParsedDocumentMetadata {
  extractedTitle: string;
  issuingOrganization: string;
  issueDate?: string;
  detectedCategory: string;
  extractedSkills: string[];
  confidenceScore: number; // 0 - 100
}

const COMMON_ISSUERS = [
  { keywords: ["aws", "amazon web services"], name: "Amazon Web Services (AWS)", category: "Certificate" },
  { keywords: ["google", "gcp", "google cloud"], name: "Google Cloud Platform", category: "Certificate" },
  { keywords: ["microsoft", "azure"], name: "Microsoft Azure", category: "Certificate" },
  { keywords: ["university", "college", "bachelor", "master", "degree", "diploma"], name: "Academic University", category: "Degree / Academic" },
  { keywords: ["coursera", "edx", "udemy", "linkedin learning"], name: "Online Learning Platform", category: "Certificate" },
  { keywords: ["passport", "republic", "national id", "identification"], name: "Government Identity Bureau", category: "ID / Passport" },
];

const SKILL_KEYWORDS = [
  "React", "Next.js", "Node.js", "TypeScript", "JavaScript", "Python", "Java", "C++",
  "Cloud Architecture", "DevOps", "Docker", "Kubernetes", "AWS", "SQL", "PostgreSQL",
  "Machine Learning", "Data Analysis", "Cybersecurity", "Project Management", "Agile", "Scrum"
];

export function parseDocumentMetadata(fileName: string, rawTextSnippet?: string): ParsedDocumentMetadata {
  const textToScan = `${fileName} ${rawTextSnippet || ""}`.toLowerCase();

  // 1. Detect Category & Issuer
  let issuingOrganization = "Verified Credential Issuer";
  let detectedCategory = "Certificate";

  for (const issuer of COMMON_ISSUERS) {
    if (issuer.keywords.some((kw) => textToScan.includes(kw))) {
      issuingOrganization = issuer.name;
      detectedCategory = issuer.category;
      break;
    }
  }

  if (textToScan.includes("cv") || textToScan.includes("resume") || textToScan.includes("curriculum")) {
    detectedCategory = "CV / Resume";
  } else if (textToScan.includes("transcript") || textToScan.includes("grades")) {
    detectedCategory = "Transcript";
  } else if (textToScan.includes("cover letter")) {
    detectedCategory = "Cover Letter";
  }

  // 2. Extract Title from File Name
  let extractedTitle = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  if (textToScan.includes("aws")) extractedTitle = "AWS Certified Solutions Architect";
  else if (textToScan.includes("bachelor")) extractedTitle = "Bachelor of Science Credential";
  else if (textToScan.includes("master")) extractedTitle = "Master of Science Degree";

  // 3. Extract Skills
  const extractedSkills = SKILL_KEYWORDS.filter((skill) =>
    textToScan.includes(skill.toLowerCase())
  );

  // 4. Extract Date
  const dateMatch = textToScan.match(/\b(20[1-2][0-9]|19[8-9][0-9])\b/);
  const issueDate = dateMatch ? `Issued ${dateMatch[0]}` : undefined;

  return {
    extractedTitle,
    issuingOrganization,
    issueDate,
    detectedCategory,
    extractedSkills: extractedSkills.length > 0 ? extractedSkills : ["Verified Competency", "Professional Proof"],
    confidenceScore: 92,
  };
}
