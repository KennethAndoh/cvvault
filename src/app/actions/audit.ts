"use server";

import { supabaseAdmin } from "@/lib/supabase";

export async function logAction(userId: string, action: string, details: any = {}) {
  const { error } = await supabaseAdmin
    .from("audit_logs")
    .insert({
      user_id: userId,
      action,
      details,
    });

  if (error) {
    console.error("Error logging action:", error);
  }
}
