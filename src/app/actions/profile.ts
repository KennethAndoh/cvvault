"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { success: true, profile: null };
    }
    console.error("Error fetching profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true, profile: data };
}

export async function updateProfile(userId: string, payload: any) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }

  await logAction(userId, "PROFILE_UPDATE", { fields: Object.keys(payload) });

  revalidatePath("/dashboard/profile");
  return { success: true, profile: data };
}

export async function createSharingToken(payload: {
  userId: string;
  documentId?: string;
  expiresAt?: string;
  permissions?: any;
}) {
  const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  
  const { data, error } = await supabase
    .from("access_tokens")
    .insert({
      user_id: payload.userId,
      document_id: payload.documentId,
      token,
      expires_at: payload.expiresAt,
      permissions: payload.permissions || { can_download: true },
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating sharing token:", error);
    return { success: false, error: error.message };
  }

  await logAction(payload.userId, "SHARING_TOKEN_CREATE", { 
    tokenId: data.id, 
    docId: payload.documentId || "full_profile" 
  });

  return { success: true, token: data };
}

export async function getSharingTokens(userId: string) {
  const { data, error } = await supabase
    .from("access_tokens")
    .select("*, documents(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching sharing tokens:", error);
    return { success: false, error: error.message };
  }

  return { success: true, tokens: data };
}

export async function deleteSharingToken(tokenId: string, userId: string) {
  const { error } = await supabase
    .from("access_tokens")
    .delete()
    .eq("id", tokenId);

  if (error) {
    console.error("Error deleting sharing token:", error);
    return { success: false, error: error.message };
  }

  await logAction(userId, "SHARING_TOKEN_DELETE", { tokenId });

  revalidatePath("/dashboard/sharing");
  return { success: true };
}
