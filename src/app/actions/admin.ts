"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { sendDocumentStatusEmail } from "@/lib/email";
import { sendDocumentStatusNotification } from "@/lib/novu";

export async function isAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("role, email")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("isAdmin check failed:", error);
    return false;
  }

  const userEmail = (data.email || "").trim().toLowerCase();
  if (userEmail === "cvvconsult1@gmail.com") {
    if (data.role !== "admin") {
      await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);
    }
    return true;
  }

  return data.role === "admin";
}

export async function getAllProfiles() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all profiles:", error);
    return { success: false, error: error.message };
  }

  return { success: true, profiles: data };
}

export async function getAllDocuments() {
  const { data, error } = await supabaseAdmin
    .from("documents")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all documents:", error);
    return { success: false, error: error.message };
  }

  return { success: true, documents: data };
}

export async function updateDocumentMetadata(id: string, metadata: any, adminUserId: string) {
  const isUserAdmin = await isAdmin(adminUserId);
  if (!isUserAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabaseAdmin
    .from("documents")
    .update({ metadata })
    .eq("id", id);

  if (error) {
    console.error("Error updating document metadata:", error);
    return { success: false, error: error.message };
  }

  // Fetch document details to send an email notification if status changed
  if (metadata.verification_status === "verified" || metadata.verification_status === "rejected") {
    const { data: docData } = await supabaseAdmin
      .from("documents")
      .select("name, user_id")
      .eq("id", id)
      .single();

    if (docData && docData.user_id) {
      const { data: profileData } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name")
        .eq("id", docData.user_id)
        .single();

      if (profileData && profileData.email) {
        // Trigger in-app / Novu notification workflow
        sendDocumentStatusNotification(
          docData.user_id,
          profileData.email,
          docData.name,
          metadata.verification_status,
          profileData.full_name
        ).catch(err => console.error("Failed to trigger Novu document notification:", err));

        // Fire and forget the fallback email sending to avoid blocking the response
        sendDocumentStatusEmail(
          profileData.email,
          docData.name,
          metadata.verification_status,
          profileData.full_name
        ).catch(err => console.error("Failed to trigger email:", err));
      }
    }
  }

  revalidatePath("/admin");
  return { success: true };
}
