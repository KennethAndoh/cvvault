import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get("candidateId");
  const viewerId = searchParams.get("viewerId");

  if (!candidateId || !viewerId) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  // Verify the viewer is authenticated (Firebase UID exists in profiles)
  const { data: viewerProfile, error: viewerError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", viewerId)
    .single();

  if (viewerError || !viewerProfile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only employers and admins can access this endpoint
  if (viewerProfile.role !== "employer" && viewerProfile.role !== "admin") {
    return NextResponse.json({ error: "Access denied. Only employers can view candidate profiles." }, { status: 403 });
  }

  // Fetch candidate profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, bio, avatar_url, role")
    .eq("id", candidateId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  // Fetch all their documents (not just public ones — employer has legitimate access)
  const { data: documents, error: docsError } = await supabaseAdmin
    .from("documents")
    .select("id, name, category, storage_path, metadata, created_at")
    .eq("user_id", candidateId)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    profile,
    documents: documents || [],
  });
}
