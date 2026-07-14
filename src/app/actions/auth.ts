"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { logAction } from "./audit";

export async function getPostAuthRedirect(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { success: true, path: "/register/role" as const };
  }

  return { success: true, path: "/dashboard" as const };
}

export async function syncUserProfile(uid: string, email: string, fullName: string, role: string = "employee") {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: uid,
      email: email,
      full_name: fullName,
      role: role,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error syncing user profile:", error);
    return { success: false, error: error.message };
  }

  await logAction(uid, "USER_SYNC", { email, fullName });

  return { success: true, profile: data };
}
