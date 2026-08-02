"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { logAction } from "./audit";

export interface ResumeData {
  targetTitle: string;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    role: string;
    period: string;
    description: string;
  }[];
  selectedDocIds: string[];
}

export async function saveCandidateResumeConfig(userId: string, data: ResumeData) {
  const { data: profile, error } = await supabaseAdmin
    .from("profiles")
    .update({
      resume_config: data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error saving resume config:", error);
    return { success: false, error: error.message };
  }

  await logAction(userId, "RESUME_CONFIG_UPDATE", { targetTitle: data.targetTitle });
  return { success: true, profile };
}

export async function getCandidateResumeData(userId: string) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const { data: docs } = await supabaseAdmin
    .from("documents")
    .select("id, name, category, verification_status, created_at")
    .eq("user_id", userId);

  return {
    success: true,
    profile,
    documents: docs || [],
  };
}
