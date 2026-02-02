"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function isAdmin(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (error || !data) return false;
  return data.role === "admin";
}

export async function getAllProfiles() {
  const { data, error } = await supabase
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
  const { data, error } = await supabase
    .from("documents")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all documents:", error);
    return { success: false, error: error.message };
  }

  return { success: true, documents: data };
}

export async function updateDocumentMetadata(id: string, metadata: any) {
  const { error } = await supabase
    .from("documents")
    .update({ metadata })
    .eq("id", id);

  if (error) {
    console.error("Error updating document metadata:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin");
  return { success: true };
}
