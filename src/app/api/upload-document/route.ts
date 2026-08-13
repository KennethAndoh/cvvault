import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/upload-document
 *
 * Fallback upload endpoint for Capacitor Android builds where Next.js Server
 * Actions are unavailable (static export / native WebView). Uses the Supabase
 * service-role key server-side so no RLS policies are triggered on the client.
 *
 * Accepts multipart/form-data with fields:
 *   - file       : the binary file blob
 *   - userId     : Firebase UID of the authenticated user
 *   - name       : display name for the document
 *   - category   : document category string
 *   - ocr        : (optional) JSON-stringified OCR metadata
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string | null;
    const name = (formData.get("name") as string) || "";
    const category = (formData.get("category") as string) || "Other";
    const ocrRaw = formData.get("ocr") as string | null;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 15MB)" }, { status: 413 });
    }

    // Verify userId exists in profiles (basic auth check without Firebase Admin)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure documents bucket exists
    try {
      const { data: bucket, error: bucketError } = await supabaseAdmin.storage.getBucket("documents");
      if (bucketError || !bucket) {
        await supabaseAdmin.storage.createBucket("documents", { public: true });
      }
    } catch {
      // bucket likely already exists, continue
    }

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
      console.error("API upload-document storage error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    let ocrMeta: any = null;
    if (ocrRaw) {
      try { ocrMeta = JSON.parse(ocrRaw); } catch { /* ignore */ }
    }

    const { data: docData, error: dbError } = await supabaseAdmin
      .from("documents")
      .insert({
        user_id: userId,
        name: name || file.name,
        storage_path: filePath,
        category,
        metadata: {
          size: file.size,
          type: file.type || "application/octet-stream",
          originalName: file.name,
          verification_status: "pending",
          ...(ocrMeta ? { ocr: ocrMeta } : {}),
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error("API upload-document db error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, document: docData });
  } catch (err: any) {
    console.error("API upload-document exception:", err);
    return NextResponse.json(
      { error: err?.message || "Failed to upload document" },
      { status: 500 }
    );
  }
}
