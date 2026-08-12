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

  const docs = data || [];
  if (docs.length === 0) {
    return { success: true, documents: [] };
  }

  // Generate signed URLs in a single batch API call for 30x faster response time
  const paths = docs.map((d) => d.storage_path).filter(Boolean);
  const signedUrlMap: Record<string, string> = {};

  try {
    const { data: signedData } = await supabaseAdmin.storage
      .from("documents")
      .createSignedUrls(paths, 3600);

    if (signedData) {
      signedData.forEach((item) => {
        if (item.path && item.signedUrl) {
          signedUrlMap[item.path] = item.signedUrl;
        }
      });
    }
  } catch (e) {
    console.error("Batch signed URL creation warning:", e);
  }

  const documentsWithUrls = docs.map((doc) => ({
    ...doc,
    url: signedUrlMap[doc.storage_path] || null,
  }));

  return { success: true, documents: documentsWithUrls };
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
    const ocrRaw = formData.get("ocr") as string | null;
    let ocrMeta: any = null;

    if (ocrRaw) {
      try {
        ocrMeta = JSON.parse(ocrRaw);
      } catch (e) {}
    }

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
        ...(ocrMeta ? { ocr: ocrMeta } : {}),
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

export async function uploadDocumentBase64(payload: {
  userId: string;
  fileName: string;
  fileType: string;
  base64Data: string;
  name?: string;
  category?: string;
  ocr?: any;
}) {
  try {
    const { userId, fileName, fileType, base64Data, name, category, ocr } = payload;
    if (!userId || !base64Data) {
      return { success: false, error: "Missing user or file data" };
    }

    await ensureBucket("documents", true);

    const fileExt = fileName.split(".").pop() || "bin";
    const storageFileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${storageFileName}`;

    const cleanBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
    const buffer = Buffer.from(cleanBase64, "base64");

    if (buffer.length > 15 * 1024 * 1024) {
      return { success: false, error: "File too large (max 15MB)" };
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(filePath, buffer, {
        contentType: fileType || "application/octet-stream",
        upsert: true,
      });

    if (uploadError) {
      console.error("Error uploading document base64:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const recordResult = await createDocumentRecord({
      userId,
      name: name || fileName,
      storagePath: filePath,
      category: category || "Other",
      metadata: {
        size: buffer.length,
        type: fileType || "application/octet-stream",
        originalName: fileName,
        verification_status: "pending",
        ...(ocr ? { ocr } : {}),
      },
    });

    if (recordResult.success && recordResult.document) {
      autoVerifyDocument(recordResult.document.id, userId).catch((err) => {
        console.error("Background auto-verification error:", err);
      });
    }

    return recordResult;
  } catch (err: any) {
    console.error("Exception in uploadDocumentBase64 server action:", err);
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
  if (!path) {
    return { success: false, error: "Invalid document path" };
  }

  // 1. Clean path if full URL is passed
  let cleanPath = path;
  if (path.includes("/documents/")) {
    cleanPath = path.split("/documents/")[1].split("?")[0];
  } else if (path.startsWith("http://") || path.startsWith("https://")) {
    cleanPath = path.split("?")[0].replace(/^https?:\/\/[^\/]+\//, "");
  }
  cleanPath = decodeURIComponent(cleanPath.replace(/^\/+/, ""));

  // 2. Fetch document record for access validation
  let doc: { user_id: string; metadata?: any } | null = null;

  const { data: exactDoc } = await supabaseAdmin
    .from("documents")
    .select("user_id, metadata")
    .eq("storage_path", cleanPath)
    .maybeSingle();

  doc = exactDoc;

  if (!doc && path !== cleanPath) {
    const { data: rawDoc } = await supabaseAdmin
      .from("documents")
      .select("user_id, metadata")
      .eq("storage_path", path)
      .maybeSingle();
    doc = rawDoc;
  }

  // 3. Authorization check
  let authorized = true;
  if (doc) {
    authorized = doc.user_id === userId || doc.metadata?.is_public === true;
    if (!authorized && userId) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();
      if (profile?.role === "admin" || profile?.role === "employer" || profile?.role === "employee") {
        authorized = true;
      }
    }
  }

  if (!authorized) {
    return { success: false, error: "Unauthorized access to document" };
  }

  // 4. Create signed URL (valid for 1 hour)
  const targetPath = cleanPath || path;
  const { data, error } = await supabaseAdmin.storage
    .from("documents")
    .createSignedUrl(targetPath, 3600);

  if (error || !data?.signedUrl) {
    // If input path was already a valid HTTP(S) URL, fall back to returning path directly
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return { success: true, signedUrl: path };
    }
    console.error("Error creating signed URL:", error);
    return { success: false, error: error?.message || "Could not generate signed URL" };
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

export async function verifyApplicantDocument(documentId: string, recruiterUserId: string) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", recruiterUserId)
    .single();

  if (!profile || (profile.role !== "employer" && profile.role !== "admin")) {
    return { success: false, error: "Only authorized recruiters or admins can verify candidate document authenticity." };
  }

  const { data: doc, error: fetchErr } = await supabaseAdmin
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (fetchErr || !doc) {
    return { success: false, error: "Document not found." };
  }

  const result = await autoVerifyDocument(documentId, doc.user_id);
  await logAction(recruiterUserId, "RECRUITER_DOCUMENT_VERIFIED", { documentId, applicantId: doc.user_id });

  return result;
}
