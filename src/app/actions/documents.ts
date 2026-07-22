"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";
import { autoVerifyDocument } from "./auto-verify";


export async function createDocumentRecord(payload: {
  userId: string;
  name: string;
  storagePath: string;
  category: string;
  metadata?: any;
}) {
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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

async function ensureBucket(bucketName: string, isPublic = true) {
  try {
    const { data: bucket, error } = await supabaseAdmin.storage.getBucket(bucketName);
    if (error || !bucket) {
      await supabaseAdmin.storage.createBucket(bucketName, { public: isPublic });
    }
  } catch (err) {
    console.warn(`Bucket check for ${bucketName}:`, err);
  }
}

export async function uploadDocument(
  userId: string,
  formData: FormData
) {
  try {
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string) || "";
    const category = (formData.get("category") as string) || "Other";

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "File too large (max 10MB)" };
    }

    await ensureBucket("documents", true);

    const fileExt = file.name.split(".").pop() || "bin";
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(filePath, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading document:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const recordResult = await createDocumentRecord({
      userId,
      name: name || file.name,
      storagePath: filePath,
      category,
      metadata: {
        size: file.size,
        type: file.type || "application/octet-stream",
        originalName: file.name,
        verification_status: "pending",
      },
    });

    if (recordResult.success && recordResult.document) {
      // Run automated verification asynchronously so it doesn't block upload response
      autoVerifyDocument(recordResult.document.id, userId).catch((err) => {
        console.error("Background auto-verification error:", err);
      });
    }

    return recordResult;
  } catch (err: any) {
    console.error("Exception in uploadDocument server action:", err);
    return { success: false, error: err?.message || "Failed to upload document. Please try again." };
  }
}

export async function deleteDocument(id: string, storagePath: string, userId: string) {
  const { data: doc, error: fetchError } = await supabaseAdmin
    .from("documents")
    .select("user_id")
    .eq("id", id)
    .single();

  if (fetchError || !doc || doc.user_id !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Delete from Storage
  const { error: storageError } = await supabaseAdmin.storage
    .from("documents")
    .remove([storagePath]);

  if (storageError) {
    console.error("Error deleting from storage:", storageError);
    return { success: false, error: storageError.message };
  }

  // 2. Delete from Database
  const { error: dbError } = await supabaseAdmin
    .from("documents")
    .delete()
    .eq("id", id);

  if (dbError) {
    console.error("Error deleting from database:", dbError);
    return { success: false, error: dbError.message };
  }

  await logAction(userId, "DOCUMENT_DELETE", { docId: id });

  revalidatePath("/dashboard/documents");
  return { success: true };
}

export async function updateDocumentVisibility(id: string, userId: string, isPublic: boolean) {
  // First get the document to merge metadata
  const { data: doc, error: fetchError } = await supabaseAdmin
    .from("documents")
    .select("metadata, user_id")
    .eq("id", id)
    .single();

  if (fetchError || !doc) {
    return { success: false, error: "Document not found" };
  }

  if (doc.user_id !== userId) {
    return { success: false, error: "Unauthorized" };
  }

  const updatedMetadata = {
    ...(doc.metadata || {}),
    is_public: isPublic
  };

  const { error: updateError } = await supabaseAdmin
    .from("documents")
    .update({ metadata: updatedMetadata })
    .eq("id", id);

  if (updateError) {
    console.error("Error updating document visibility:", updateError);
    return { success: false, error: updateError.message };
  }

  await logAction(userId, "DOCUMENT_VISIBILITY_UPDATE", { docId: id, isPublic });

  revalidatePath("/dashboard/documents");
  revalidatePath(`/p/${userId}`);
  return { success: true };
}

export async function getSignedUrlForDocument(path: string, userId: string) {
  // Fetch the document to verify ownership
  const { data: doc, error: fetchError } = await supabaseAdmin
    .from("documents")
    .select("user_id")
    .eq("storage_path", path)
    .single();

  if (fetchError || !doc) {
    return { success: false, error: "Document not found" };
  }

  // Check if user is owner, admin, or employer (can view applicant docs)
  let authorized = doc.user_id === userId;
  if (!authorized) {
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();
    if (profile?.role === "admin" || profile?.role === "employer") {
      authorized = true;
    }
  }

  if (!authorized) {
    return { success: false, error: "Unauthorized access to document" };
  }

  const { data, error } = await supabaseAdmin.storage
    .from("documents")
    .createSignedUrl(path, 60);

  if (error) {
    console.error("Error creating signed URL:", error);
    return { success: false, error: error.message };
  }

  return { success: true, signedUrl: data.signedUrl };
}

export async function getSignedUrlForShareToken(token: string, documentId?: string) {
  // 1. Fetch token and profile
  const { data: accessToken, error: tokenError } = await supabaseAdmin
    .from("access_tokens")
    .select("*, documents(*)")
    .eq("token", token)
    .single();

  if (tokenError || !accessToken) {
    return { success: false, error: "Invalid sharing link" };
  }

  // 2. Check expiry
  if (accessToken.expires_at && new Date(accessToken.expires_at) < new Date()) {
    return { success: false, error: "Sharing link has expired" };
  }

  let pathToSign = "";
  if (accessToken.document_id) {
    // Token is scoped to a single document
    if (documentId && accessToken.document_id !== documentId) {
      return { success: false, error: "Unauthorized access to this document" };
    }
    pathToSign = accessToken.documents?.storage_path || "";
    if (!pathToSign) {
      return { success: false, error: "Document not found" };
    }
  } else if (documentId) {
    // Token is for full profile, verify the document belongs to the profile owner
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("storage_path, user_id")
      .eq("id", documentId)
      .single();

    if (docError || !doc || doc.user_id !== accessToken.user_id) {
      return { success: false, error: "Document not found or unauthorized" };
    }
    pathToSign = doc.storage_path;
  } else {
    return { success: false, error: "No document specified" };
  }

  // Generate signed URL
  const { data, error } = await supabaseAdmin.storage
    .from("documents")
    .createSignedUrl(pathToSign, 60);

  if (error) {
    console.error("Error creating signed URL for share token:", error);
    return { success: false, error: error.message };
  }

  // Log sharing view activity
  await logAction(accessToken.user_id, "TOKEN_DOCUMENT_DOWNLOAD", { 
    token, 
    docId: documentId || accessToken.document_id 
  });

  return { success: true, signedUrl: data.signedUrl };
}
