import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get("path");
  const userId = searchParams.get("userId");

  if (!path || !userId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Verify the requester has permission (owner, employer, or admin)
  const { data: viewerProfile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (!viewerProfile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // If not an employer or admin, verify they own the document
  if (viewerProfile.role !== "employer" && viewerProfile.role !== "admin") {
    const { data: doc } = await supabaseAdmin
      .from("documents")
      .select("user_id")
      .eq("storage_path", path)
      .single();

    if (!doc || doc.user_id !== userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }
  }

  const { data, error } = await supabaseAdmin.storage
    .from("documents")
    .createSignedUrl(path, 300); // 5 min access

  if (error || !data) {
    return NextResponse.json({ error: error?.message || "Failed to create signed URL" }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl });
}
