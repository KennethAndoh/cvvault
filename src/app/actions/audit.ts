"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { headers } from "next/headers";

export async function logAction(userId: string, action: string, details: any = {}) {
  let clientIp = details.ip;
  let userAgent = details.userAgent;

  try {
    const headerList = await headers();
    if (!clientIp) {
      const forwarded = headerList.get("x-forwarded-for");
      clientIp = forwarded ? forwarded.split(",")[0].trim() : (headerList.get("x-real-ip") || "");
    }
    if (!userAgent) {
      userAgent = headerList.get("user-agent") || "";
    }
  } catch {
    // Graceful fallback if called outside an active HTTP request
  }

  const enrichedDetails = {
    ...details,
    ...(clientIp ? { ip: clientIp } : {}),
    ...(userAgent ? { userAgent } : {}),
  };

  const { error } = await supabaseAdmin
    .from("audit_logs")
    .insert({
      user_id: userId,
      action,
      details: enrichedDetails,
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
