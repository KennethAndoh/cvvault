"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";

export async function createDocumentRecord(payload: {
  userId: string;
  name: string;
  storagePath: string;
  category: string;
  metadata?: any;
}) {
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: payload.userId,
      name: payload.name,
      storage_path: payload.storagePath,
      category: payload.category,
      metadata: payload.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating document record:", error);
    return { success: false, error: error.message };
  }

  await logAction(payload.userId, "DOCUMENT_UPLOAD", { 
    docId: data.id, 
    name: payload.name,
    category: payload.category 
  });

  revalidatePath("/dashboard/documents");
  return { success: true, document: data };
}

export async function getDocuments(userId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return { success: false, error: error.message };
  }

  return { success: true, documents: data };
}

export async function deleteDocument(id: string, storagePath: string) {
  // 1. Delete from Storage
  const { error: storageError } = await supabase.storage
    .from("documents")
    .remove([storagePath]);

  if (storageError) {
    console.error("Error deleting from storage:", storageError);
    return { success: false, error: storageError.message };
  }

  // 2. Delete from Database
  const { error: dbError } = await supabase
    .from("documents")
    .delete()
    .eq("id", id);

  if (dbError) {
    console.error("Error deleting from database:", dbError);
    return { success: false, error: dbError.message };
  }

  revalidatePath("/dashboard/documents");
  return { success: true };
}
