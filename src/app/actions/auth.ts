"use server";

import { supabase } from "@/lib/supabase";
import { logAction } from "./audit";

export async function syncUserProfile(uid: string, email: string, fullName: string, role: string = "employee") {
  const { data, error } = await supabase
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
