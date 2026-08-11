"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateFcmToken } from "@/app/actions/settings";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function PushNotificationListener() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const setupPush = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        
        // Only run native PushNotifications on Capacitor mobile apps (Android/iOS)
        if (!Capacitor.isNativePlatform()) return;

        // @ts-ignore - Dynamic import for native push notifications plugin
        const pushModule = await import("@capacitor/push-notifications").catch(() => null);
        if (!pushModule || !pushModule.PushNotifications) return;

        const PushNotifications = pushModule.PushNotifications;

        // Request permissions
        let permStatus = await PushNotifications.checkPermissions();
        if (permStatus.receive === "prompt" || permStatus.receive === "prompt-with-rationale") {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive !== "granted") {
          console.log("[PushNotifications] Permission not granted:", permStatus.receive);
          return;
        }

        // Register with Apple / Google Cloud Messaging
        await PushNotifications.register();

        // On successful registration, save FCM token to user's profile
        await PushNotifications.addListener("registration", async (token: { value: string }) => {
          if (token?.value && isMounted) {
            console.log("[PushNotifications] Registered FCM token:", token.value);
            await updateFcmToken(user.uid, token.value);
          }
        });

        // Registration error handling
        await PushNotifications.addListener("registrationError", (error: any) => {
          console.error("[PushNotifications] Registration error:", error);
        });

        // Notification received while app is running in foreground
        await PushNotifications.addListener("pushNotificationReceived", (notification: any) => {
          console.log("[PushNotifications] Received in foreground:", notification);
          toast(notification.title || "New Notification", {
            description: notification.body || "",
            action: notification.data?.url ? {
              label: "View",
              onClick: () => router.push(notification.data.url)
            } : undefined
          });
        });

        // Notification action performed (user tapped notification banner)
        await PushNotifications.addListener("pushNotificationActionPerformed", (action: any) => {
          console.log("[PushNotifications] Action performed:", action);
          const url = action.notification.data?.url;
          if (url) {
            router.push(url);
          }
        });

      } catch (err) {
        console.warn("[PushNotifications] Native push setup failed or non-native environment:", err);
      }
    };

    setupPush();

    return () => {
      isMounted = false;
    };
  }, [user, router]);

  return null;
}
