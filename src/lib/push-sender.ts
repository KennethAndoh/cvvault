import { adminMessaging } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

export interface SendPushNotificationOptions {
  userId: string;
  title: string;
  body: string;
  url?: string;
  data?: Record<string, string>;
}

/**
 * Sends direct FCM push notification to a user's registered Android app / browser FCM token.
 */
export async function sendPushToUser({
  userId,
  title,
  body,
  url,
  data = {},
}: SendPushNotificationOptions): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Fetch user's registered fcm_token from profiles table
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("fcm_token")
      .eq("id", userId)
      .maybeSingle();

    if (error || !profile?.fcm_token) {
      console.warn(`[PushSender] No FCM token found for user '${userId}'.`);
      return { success: false, error: "No FCM token for user" };
    }

    const token = profile.fcm_token;

    // 2. Dispatch FCM message via Firebase Admin SDK
    const response = await adminMessaging.send({
      token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        url: url || "/dashboard",
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "default",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
      },
    });

    console.log(`[PushSender] Successfully sent FCM push to user '${userId}', messageId: ${response}`);
    return { success: true };
  } catch (err: any) {
    console.error(`[PushSender] Failed to send FCM push to user '${userId}':`, err?.message || err);
    return { success: false, error: err?.message || "FCM send error" };
  }
}
