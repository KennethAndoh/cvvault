"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { send2FaOtpNotification } from "@/lib/novu";

export async function updateFcmToken(userId: string, token: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ fcm_token: token })
    .eq("id", userId);
  return { success: !error, error: error?.message };
}

export async function toggle2FA(userId: string, enabled: boolean) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ two_factor_enabled: enabled })
    .eq("id", userId);
  revalidatePath("/dashboard/settings");
  return { success: !error, error: error?.message };
}

export async function getActiveSessions(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("last_active", { ascending: false });
  return { success: !error, sessions: data || [], error: error?.message };
}

export async function createSession(userId: string, deviceInfo: string, ipAddress: string) {
  const { error } = await supabaseAdmin
    .from("user_sessions")
    .insert({ user_id: userId, device_info: deviceInfo, ip_address: ipAddress });
  return { success: !error, error: error?.message };
}

export async function revokeAllSessions(userId: string) {
  const { error } = await supabaseAdmin
    .from("user_sessions")
    .delete()
    .eq("user_id", userId);
  revalidatePath("/dashboard/settings");
  return { success: !error, error: error?.message };
}

export async function getProfileSettings(userId: string) {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("fcm_token, two_factor_enabled")
        .eq("id", userId)
        .single();
    return { success: !error, settings: data, error: error?.message };
}

export async function generateAndSendOtp(userId: string, email: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP in profiles table
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ otp_code: otp })
    .eq("id", userId);
    
  if (error) return { success: false, error: error.message };
  
  console.log(`[2FA] OTP for ${email} is ${otp}`);

  // Send via Novu if configured, or Resend as fallback
  try {
    const res = await send2FaOtpNotification(userId, email, otp);
    if (!res.success) {
      // Resend Fallback
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey && email) {
        const { Resend } = await import("resend");
        const resend = new Resend(resendApiKey);
        await resend.emails.send({
          from: "CVVault <onboarding@resend.dev>",
          to: [email],
          subject: "Your 2FA Verification Code - CVVault",
          html: `
            <div style="font-family: sans-serif; padding: 24px; max-width: 480px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
              <h2 style="color: #3482BE; text-align: center; margin-top: 0;">CVVault 2FA Verification</h2>
              <p style="color: #475569; font-size: 14px;">Your 6-digit verification code is:</p>
              <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #0f172a; border-radius: 8px; margin: 16px 0;">
                ${otp}
              </div>
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-bottom: 0;">If you did not request this code, please ignore this email.</p>
            </div>
          `,
        });
      }
    }
  } catch (err) {
    console.error("Error triggering 2FA notification:", err);
  }
  
  return { success: true, otp };
}

export async function verifyOtp(userId: string, code: string) {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("otp_code")
    .eq("id", userId)
    .single();
    
  if (error || !data) return { success: false, error: "Failed to verify OTP." };
  
  if (data.otp_code === code.trim()) {
    // Clear OTP after successful verification
    await supabaseAdmin.from("profiles").update({ otp_code: null }).eq("id", userId);
    return { success: true };
  }
  
  return { success: false, error: "Invalid OTP code." };
}
