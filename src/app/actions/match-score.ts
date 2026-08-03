"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export interface JobMatchResult {
  score: number; // 0 - 100
  tier: "Exceptional" | "Strong" | "Moderate" | "Basic";
  matchingSkills: string[];
  missingSkills: string[];
  verifiedDocsCount: number;
  bonusPoints: number;
}

export async function calculateCandidateJobMatch(
  candidateId: string,
  jobId: string
): Promise<{ success: boolean; match?: JobMatchResult; error?: string }> {
  try {
    // 1. Fetch Job Post
    const { data: job, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return { success: false, error: "Job posting not found" };
    }

    // 2. Fetch Candidate Profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", candidateId)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Candidate profile not found" };
    }

    // 3. Fetch Candidate Verified Documents
    const { data: documents } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("user_id", candidateId);

    const verifiedDocs = (documents || []).filter(
      (d) => d.metadata?.verification_status === "verified"
    );

    // Normalize job requirements
    const requiredSkills: string[] = Array.isArray(job.requirements)
      ? job.requirements.flatMap((r: string) => r.split(",")).map((s: string) => s.trim().toLowerCase())
      : typeof job.requirements === "string"
      ? job.requirements.split(",").map((s: string) => s.trim().toLowerCase())
      : [];

    // Normalize candidate skills
    const candidateSkills: string[] = Array.isArray(profile.skills)
      ? profile.skills.map((s: string) => s.trim().toLowerCase())
      : typeof profile.skills === "string"
      ? profile.skills.split(",").map((s: string) => s.trim().toLowerCase())
      : [];

    // Collect skills from verified document names/categories/metadata
    const docKeywords: string[] = verifiedDocs.flatMap((d) => [
      d.name.toLowerCase(),
      d.category.toLowerCase(),
      ...(d.metadata?.skills || []).map((s: string) => s.toLowerCase()),
    ]);

    const allCandidateKeywords = new Set([...candidateSkills, ...docKeywords]);

    // Calculate Skill Matches
    const matchingSkills: string[] = [];
    const missingSkills: string[] = [];

    requiredSkills.forEach((reqSkill) => {
      if (!reqSkill) return;
      const isMatch = Array.from(allCandidateKeywords).some(
        (candSkill) => candSkill.includes(reqSkill) || reqSkill.includes(candSkill)
      );
      if (isMatch) {
        matchingSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    // Score Calculations
    let skillScore = requiredSkills.length > 0
      ? (matchingSkills.length / requiredSkills.length) * 60
      : 40; // Default base if job has no explicit skills listed

    // Verified Credentials Bonus (up to 25 points)
    const verifiedBonus = Math.min(verifiedDocs.length * 8, 25);

    // Profile & Work Experience Completeness Bonus (up to 15 points)
    let profileBonus = 0;
    if (profile.bio) profileBonus += 5;
    if (profile.work_history && profile.work_history.length > 0) profileBonus += 5;
    if (profile.portfolio_items && profile.portfolio_items.length > 0) profileBonus += 5;

    const totalScore = Math.min(Math.round(skillScore + verifiedBonus + profileBonus), 99);

    let tier: "Exceptional" | "Strong" | "Moderate" | "Basic" = "Basic";
    if (totalScore >= 85) tier = "Exceptional";
    else if (totalScore >= 70) tier = "Strong";
    else if (totalScore >= 50) tier = "Moderate";

    return {
      success: true,
      match: {
        score: Math.max(totalScore, 45), // Min baseline 45% for relevant candidates
        tier,
        matchingSkills,
        missingSkills,
        verifiedDocsCount: verifiedDocs.length,
        bonusPoints: verifiedBonus + profileBonus,
      },
    };
  } catch (error: any) {
    console.error("Error calculating candidate match:", error);
    return { success: false, error: error.message || "Failed to calculate match" };
  }
}

export async function getBulkCandidateMatchScores(
  jobId: string,
  candidateIds: string[]
): Promise<Record<string, number>> {
  const scores: Record<string, number> = {};
  await Promise.all(
    candidateIds.map(async (candId) => {
      const res = await calculateCandidateJobMatch(candId, jobId);
      if (res.success && res.match) {
        scores[candId] = res.match.score;
      } else {
        scores[candId] = 65; // Neutral fallback
      }
    })
  );
  return scores;
}
