"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { adminAuth } from "@/lib/firebase-admin";
import { logAction } from "./audit";

export async function getPostAuthRedirect(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { success: true, path: "/register/role" as const };
  }

  return { success: true, path: "/dashboard" as const };
}

export async function syncUserProfile(uid: string, email: string, fullName: string, role?: string) {
  // Check if profile already exists to preserve existing role (e.g. recruiter/employer)
  const { data: existingProfile } = await supabaseAdmin
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", uid)
    .single();

  // Keep existing role if profile exists, unless explicitly specified otherwise
  const finalRole = existingProfile?.role || role || "employee";
  const finalFullName = fullName || existingProfile?.full_name || "User";

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .upsert({
      id: uid,
      email: email || existingProfile?.email || "",
      full_name: finalFullName,
      role: finalRole,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error syncing user profile:", error);
    return { success: false, error: error.message };
  }

  await logAction(uid, "USER_SYNC", { email, fullName, role: finalRole });

  return { success: true, profile: data };
}

export async function deleteUserAccount(userId: string) {
  try {
    // 1. Get all user documents to delete storage files
    const { data: documents } = await supabaseAdmin
      .from("documents")
      .select("id, storage_path")
      .eq("user_id", userId);

    // 2. Delete files from Supabase Storage
    if (documents && documents.length > 0) {
      const storagePaths = documents
        .map((doc) => doc.storage_path)
        .filter(Boolean);

      if (storagePaths.length > 0) {
        await supabaseAdmin.storage.from("documents").remove(storagePaths).catch((err) => {
          console.warn("Storage deletion warning:", err);
        });
      }
    }

    // 3. Delete avatar from storage if it exists
    const avatarPaths = [`avatars/${userId}`];
    await supabaseAdmin.storage.from("documents").remove(avatarPaths).catch(() => {});

    // 4. Delete all related database records
    // Sharing tokens
    await supabaseAdmin.from("sharing_tokens").delete().eq("user_id", userId);

    // Job applications by this user
    await supabaseAdmin.from("job_applications").delete().eq("employee_id", userId);

    // Job applications TO this user's jobs
    const { data: userJobs } = await supabaseAdmin
      .from("jobs")
      .select("id")
      .eq("employer_id", userId);
    if (userJobs && userJobs.length > 0) {
      const jobIds = userJobs.map((j) => j.id);
      await supabaseAdmin.from("job_applications").delete().in("job_id", jobIds);
    }

    // Jobs posted by this user
    await supabaseAdmin.from("jobs").delete().eq("employer_id", userId);

    // Chat messages in chats involving this user
    const { data: userChats } = await supabaseAdmin
      .from("chats")
      .select("id")
      .or(`employee_id.eq.${userId},employer_id.eq.${userId}`);
    if (userChats && userChats.length > 0) {
      const chatIds = userChats.map((c) => c.id);
      await supabaseAdmin.from("chat_messages").delete().in("chat_id", chatIds);
      await supabaseAdmin.from("chats").delete().in("id", chatIds);
    }

    // Documents
    await supabaseAdmin.from("documents").delete().eq("user_id", userId);

    // User sessions (Corrected table name)
    await supabaseAdmin.from("user_sessions").delete().eq("user_id", userId);

    // Audit logs
    await supabaseAdmin.from("audit_logs").delete().eq("user_id", userId);

    // Profile (last, since other tables reference it via FK)
    const { error: profileErr } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
    if (profileErr) {
      console.error("Error deleting profile row:", profileErr);
    }

    // 5. Delete the Firebase Auth user
    try {
      await adminAuth.deleteUser(userId);
    } catch (firebaseErr: any) {
      if (firebaseErr?.code !== "auth/user-not-found") {
        console.warn("Firebase Auth deletion notice:", firebaseErr?.message || firebaseErr);
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user account:", error);
    return { success: false, error: error.message || "Failed to delete account." };
  }
}
