export interface ParsedDocumentMetadata {
  extractedTitle: string;
  issuingOrganization: string;
  issueDate?: string;
  detectedCategory: string;
  extractedSkills: string[];
  confidenceScore: number; // Dynamic score 70 - 98
  summarySnippet?: string;
}

interface KnownIssuer {
  keywords: string[];
  name: string;
  category: string;
}

const KNOWN_ISSUERS: KnownIssuer[] = [
  // Cloud & Tech Certifications
  { keywords: ["aws", "amazon web services", "amazon certified"], name: "Amazon Web Services (AWS)", category: "Certificate" },
  { keywords: ["google cloud", "gcp", "google certified", "google analytics", "google career"], name: "Google Cloud Platform", category: "Certificate" },
  { keywords: ["microsoft", "azure", "microsoft certified", "msft"], name: "Microsoft Azure", category: "Certificate" },
  { keywords: ["cisco", "ccna", "ccnp", "ccie"], name: "Cisco Systems", category: "Certificate" },
  { keywords: ["comptia", "security+", "network+", "a+"], name: "CompTIA", category: "Certificate" },
  { keywords: ["oracle", "java certified", "oracle database"], name: "Oracle Corporation", category: "Certificate" },
  { keywords: ["pmi", "pmp", "project management institute"], name: "Project Management Institute (PMI)", category: "Certificate" },
  { keywords: ["scrum alliance", "certified scrum master", "csm", "scrum.org"], name: "Scrum Alliance", category: "Certificate" },
  
  // Learning Platforms
  { keywords: ["coursera"], name: "Coursera Academy", category: "Certificate" },
  { keywords: ["udemy"], name: "Udemy Learning", category: "Certificate" },
  { keywords: ["edx"], name: "edX International", category: "Certificate" },
  { keywords: ["linkedin learning", "lynda"], name: "LinkedIn Learning", category: "Certificate" },
  { keywords: ["pluralsight"], name: "Pluralsight", category: "Certificate" },
  { keywords: ["udacity", "nanodegree"], name: "Udacity Nanodegree", category: "Certificate" },

  // Academic Institutions
  { keywords: ["stanford", "stanford university"], name: "Stanford University", category: "Certificate" },
  { keywords: ["harvard", "harvard university"], name: "Harvard University", category: "Certificate" },
  { keywords: ["mit", "massachusetts institute of technology"], name: "MIT", category: "Certificate" },
  { keywords: ["oxford", "university of oxford"], name: "University of Oxford", category: "Certificate" },
  { keywords: ["cambridge", "university of cambridge"], name: "University of Cambridge", category: "Certificate" },
  { keywords: ["university", "college", "polytechnic", "institute of technology", "academy of science"], name: "Higher Education Institution", category: "Certificate" },

  // Identity / Government
  { keywords: ["passport", "republic", "federation", "national id", "identification card", "driver license", "citizenship"], name: "Government Identity Authority", category: "National ID" },
];

const EXTRACTABLE_SKILLS = [
  // Engineering & Tech
  "React", "Next.js", "Node.js", "TypeScript", "JavaScript", "Python", "Java", "C++", "C#", "Go", "Rust", "PHP",
  "Swift", "Kotlin", "HTML5", "CSS3", "Tailwind CSS", "SQL", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST API",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "DevOps", "CI/CD", "Linux", "Git", "System Architecture",
  
  // Data & Intelligence
  "Machine Learning", "Deep Learning", "Artificial Intelligence", "Data Analysis", "Data Science", "Pandas", "NumPy",
  "TensorFlow", "PyTorch", "PowerBI", "Tableau", "SQL Analytics",

  // Management & Business
  "Project Management", "Product Management", "Agile", "Scrum", "Kanban", "Strategic Planning", "Financial Analysis",
  "Leadership", "Operations Management", "Risk Management", "Business Strategy", "Public Speaking",

  // Design & Media
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator", "Digital Marketing", "SEO", "Content Strategy",

  // Security & Infrastructure
  "Cybersecurity", "Network Security", "Penetration Testing", "Ethical Hacking", "Cryptography", "Information Security"
];

export function parseDocumentMetadata(fileName: string, rawTextSnippet?: string): ParsedDocumentMetadata {
  const textToScan = `${fileName} ${rawTextSnippet || ""}`.toLowerCase();
  const hasExtractedContent = Boolean(rawTextSnippet && rawTextSnippet.trim().length > 10);

  // 1. Detect Category & Issuing Organization
  let detectedCategory = "CV / Resume";
  let issuingOrganization = "Verified Credential Issuer";
  let specificIssuerFound = false;

  for (const issuer of KNOWN_ISSUERS) {
    if (issuer.keywords.some((kw) => textToScan.includes(kw))) {
      issuingOrganization = issuer.name;
      detectedCategory = issuer.category;
      specificIssuerFound = true;
      break;
    }
  }

  // Refine Category if not matched by specific issuer
  if (textToScan.includes("resume") || textToScan.includes("cv") || textToScan.includes("curriculum vitae") || textToScan.includes("work experience")) {
    detectedCategory = "CV / Resume";
    if (!specificIssuerFound) issuingOrganization = "Candidate Professional Profile";
  } else if (textToScan.includes("certif") || textToScan.includes("completion") || textToScan.includes("accomplishment") || textToScan.includes("license")) {
    detectedCategory = "Certificate";
    if (!specificIssuerFound) issuingOrganization = "Professional Certification Authority";
  } else if (textToScan.includes("bachelor") || textToScan.includes("master") || textToScan.includes("degree") || textToScan.includes("diploma") || textToScan.includes("phd")) {
    detectedCategory = "Certificate"; // Maps to Certificates category in system
    if (!specificIssuerFound) issuingOrganization = "Accredited University / College";
  } else if (textToScan.includes("transcript") || textToScan.includes("gpa") || textToScan.includes("grades")) {
    detectedCategory = "Other Supporting Document";
    if (!specificIssuerFound) issuingOrganization = "Academic Institution";
  } else if (textToScan.includes("passport")) {
    detectedCategory = "Passport";
    if (!specificIssuerFound) issuingOrganization = "Government Passport Office";
  } else if (textToScan.includes("national id") || textToScan.includes("identity card") || textToScan.includes("driver license")) {
    detectedCategory = "National ID";
    if (!specificIssuerFound) issuingOrganization = "Government Identity Bureau";
  } else if (textToScan.includes("recommendation") || textToScan.includes("reference")) {
    detectedCategory = "Recommendation Letter";
    if (!specificIssuerFound) issuingOrganization = "Professional Reference";
  } else if (textToScan.includes("cover letter")) {
    detectedCategory = "Cover Letter";
    if (!specificIssuerFound) issuingOrganization = "Applicant Cover Letter";
  }

  // 2. Dynamic Title Extraction
  let extractedTitle = "";

  // Attempt header title extraction from first clean line of text snippet if present
  if (rawTextSnippet && rawTextSnippet.trim().length > 15) {
    const lines = rawTextSnippet
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 3 && !l.startsWith("<?xml") && !l.startsWith("<w:"));
    if (lines.length > 0) {
      const candidateHeader = lines[0].slice(0, 65);
      if (/^[A-Za-z0-9\s\-_.,&()]{4,65}$/.test(candidateHeader)) {
        extractedTitle = candidateHeader;
      }
    }
  }

  if (!extractedTitle) {
    // Derive clean title from filename
    extractedTitle = fileName
      .replace(/\.[^/.]+$/, "") // Remove file extension
      .replace(/^[0-9a-fA-Z]{8,}_/, "") // Strip UUID prefixes
      .replace(/_\d{10,}$/, "") // Strip timestamp suffixes
      .replace(/[-_]/g, " ")
      .trim();

    // Capitalize words cleanly
    extractedTitle = extractedTitle.replace(/\b\w/g, (char) => char.toUpperCase());

    // Contextual title enhancements
    if (textToScan.includes("aws") && textToScan.includes("certif")) {
      extractedTitle = "AWS Certified Solutions Architect";
    } else if (textToScan.includes("bachelor") && textToScan.includes("science")) {
      extractedTitle = "Bachelor of Science Credential";
    } else if (textToScan.includes("master") && textToScan.includes("science")) {
      extractedTitle = "Master of Science Degree";
    }
  }

  // 3. Dynamic Skill Extraction
  const extractedSkills = EXTRACTABLE_SKILLS.filter((skill) => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return regex.test(textToScan);
  });

  // 4. Dynamic Date Parsing
  let issueDate: string | undefined = undefined;
  const yearMatch = textToScan.match(/\b(20[1-2][0-9]|19[8-9][0-9])\b/);
  const monthYearMatch = textToScan.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(20[1-2][0-9])\b/i);

  if (monthYearMatch) {
    issueDate = `Issued ${monthYearMatch[0].toUpperCase()}`;
  } else if (yearMatch) {
    issueDate = `Issued ${yearMatch[0]}`;
  }

  // 5. Dynamic Confidence Score Calculation (72 - 98%)
  let confidenceScore = 72;
  if (hasExtractedContent) confidenceScore += 10;
  if (specificIssuerFound) confidenceScore += 8;
  if (extractedSkills.length > 0) confidenceScore += Math.min(extractedSkills.length * 2, 5);
  if (issueDate) confidenceScore += 3;

  confidenceScore = Math.min(Math.max(confidenceScore, 72), 98);

  const fallbackSkills = detectedCategory === "CV / Resume" 
    ? ["Professional Experience", "Career Portfolio"]
    : ["Verified Competency", "Credential Authenticity"];

  return {
    extractedTitle: extractedTitle || fileName,
    issuingOrganization,
    issueDate,
    detectedCategory,
    extractedSkills: extractedSkills.length > 0 ? extractedSkills : fallbackSkills,
    confidenceScore,
    summarySnippet: hasExtractedContent ? rawTextSnippet?.slice(0, 150) + "..." : undefined,
  };
}
