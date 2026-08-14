import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { autoVerifyDocument } from "@/app/actions/auto-verify";
import { logAction } from "@/app/actions/audit";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-user-id",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200, headers: corsHeaders });
}

/**
 * POST /api/upload-document
 *
 * Universal upload endpoint for Web and Capacitor Android/iOS builds.
 * Uses the Supabase service-role key server-side so RLS policies don't block mobile uploads.
 *
 * Supports:
 *   1. JSON payload with base64Data or register_record mode
 *   2. Multipart/form-data with binary file blob
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let userId = "";
    let name = "";
    let category = "Other";
    let ocrMeta: any = null;
    let fileBuffer: Buffer | null = null;
    let fileType = "application/octet-stream";
    let fileName = "";
    let fileSize = 0;
    let action = "upload";
    let existingStoragePath = "";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      userId = body.userId || "";
      name = body.name || "";
      category = body.category || "Other";
      ocrMeta = body.ocr || null;
      action = body.action || "upload";
      existingStoragePath = body.storagePath || "";

      if (action === "create_record") {
        // Record registration mode when client already uploaded to Supabase Storage
        fileType = body.fileType || "application/octet-stream";
        fileName = body.fileName || name || "document.pdf";
        fileSize = body.fileSize || 0;
      } else if (body.base64Data) {
        fileName = body.fileName || name || "document.pdf";
        fileType = body.fileType || "application/octet-stream";
        const cleanBase64 = body.base64Data.includes(",")
          ? body.base64Data.split(",")[1]
          : body.base64Data;
        fileBuffer = Buffer.from(cleanBase64, "base64");
        fileSize = fileBuffer.length;
      }
    } else {
      // multipart/form-data
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      userId = (formData.get("userId") as string) || "";
      name = (formData.get("name") as string) || "";
      category = (formData.get("category") as string) || "Other";
      const ocrRaw = formData.get("ocr") as string | null;

      if (ocrRaw) {
        try {
          ocrMeta = JSON.parse(ocrRaw);
        } catch {
          /* ignore */
        }
      }

      if (file) {
        fileName = file.name;
        fileType = file.type || "application/octet-stream";
        fileSize = file.size;
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify userId exists in profiles
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Unauthorized user" },
        { status: 401, headers: corsHeaders }
      );
    }

    // Mode 1: Create DB Record for already-uploaded file in Supabase Storage
    if (action === "create_record" && existingStoragePath) {
      const { data: docData, error: dbError } = await supabaseAdmin
        .from("documents")
        .insert({
          user_id: userId,
          name: name || fileName,
          storage_path: existingStoragePath,
          category,
          metadata: {
            size: fileSize,
            type: fileType,
            originalName: fileName,
            verification_status: "pending",
            ...(ocrMeta ? { ocr: ocrMeta } : {}),
          },
        })
        .select()
        .single();

      if (dbError) {
        console.error("API upload-document db error:", dbError);
        return NextResponse.json(
          { error: dbError.message },
          { status: 500, headers: corsHeaders }
        );
      }

      await logAction(userId, "DOCUMENT_UPLOAD", {
        docId: docData.id,
        name: name || fileName,
        category,
      });

      autoVerifyDocument(docData.id, userId).catch((err) => {
        console.error("Background auto-verification error:", err);
      });

      return NextResponse.json(
        { success: true, document: docData },
        { status: 200, headers: corsHeaders }
      );
    }

    // Mode 2: Handle file upload through API
    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json(
        { error: "No file content provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    if (fileSize > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large (max 25MB)" },
        { status: 413, headers: corsHeaders }
      );
    }

    // Ensure documents bucket exists
    try {
      const { data: bucket, error: bucketError } =
        await supabaseAdmin.storage.getBucket("documents");
      if (bucketError || !bucket) {
        await supabaseAdmin.storage.createBucket("documents", { public: true });
      }
    } catch {
      // bucket likely exists
    }

    const fileExt = fileName.split(".").pop() || "bin";
    const storageFileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${storageFileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("documents")
      .upload(filePath, fileBuffer, {
        contentType: fileType,
        upsert: true,
      });

    if (uploadError) {
      console.error("API upload-document storage error:", uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    const { data: docData, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: userId,
        name: name || fileName,
        storage_path: filePath,
        category,
        metadata: {
          size: fileSize,
          type: fileType,
          originalName: fileName,
          verification_status: "pending",
          ...(ocrMeta ? { ocr: ocrMeta } : {}),
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("API upload-document db error:", dbError);
      return NextResponse.json(
        { error: dbError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    await logAction(userId, "DOCUMENT_UPLOAD", {
      docId: docData.id,
      name: name || fileName,
      category,
    });

    autoVerifyDocument(docData.id, userId).catch((err) => {
      console.error("Background auto-verification error:", err);
    });

    return NextResponse.json(
      { success: true, document: docData },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("API upload-document exception:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload document" },
      { status: 500, headers: corsHeaders }
    );
  }
}
