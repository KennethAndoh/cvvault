"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

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

export async function getRecentAuditLogs(userId: string, limit = 10) {
  const { data, error } = await supabaseAdmin
    .from("audit_logs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching audit logs:", error);
    return { success: false, error: error.message, logs: [] };
  }

  return { success: true, logs: data || [] };
}
