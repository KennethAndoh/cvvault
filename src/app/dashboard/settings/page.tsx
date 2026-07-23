"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Lock, Eye, Trash2, Smartphone, ShieldAlert, Monitor, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateFcmToken, toggle2FA, getActiveSessions, revokeAllSessions, getProfileSettings } from "@/app/actions/settings";
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";

export default function SettingsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    security: true
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    const [settingsRes, sessionsRes] = await Promise.all([
      getProfileSettings(user!.uid),
      getActiveSessions(user!.uid)
    ]);

    if (settingsRes.success && settingsRes.settings) {
      setTwoFactorEnabled(settingsRes.settings.two_factor_enabled || false);
      setNotifications(prev => ({ ...prev, push: !!settingsRes.settings.fcm_token }));
    }

    if (sessionsRes.success) {
      setSessions(sessionsRes.sessions);
    }
    setLoading(false);
  };

  const handlePushToggle = async (checked: boolean) => {
    if (!user) return;
    
    if (checked) {
      try {
        if (!messaging) {
          toast.error("Push notifications are not supported in this browser.");
          return;
        }
        
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BMWrQ375VUgCiXBdnkdpk8-GpEV-yLVrTK1hNMLIsuiNEXR448EVn4ELPvqXu1zvBGFMYW6NQIbtxVsyXhwija0";
          const token = await getToken(messaging, { vapidKey });
          
          if (token) {
            await updateFcmToken(user.uid, token);
            setNotifications({ ...notifications, push: true });
            toast.success("Push notifications enabled!");
          } else {
            toast.error("Failed to generate push token.");
          }
        } else {
          toast.error("Notification permission denied.");
        }
      } catch (error: any) {
        console.error(error);
        toast.error("Error setting up push notifications", {
          description: error?.message || "Please check browser permissions and VAPID configuration."
        });
      }
    } else {
      await updateFcmToken(user.uid, "");
      setNotifications({ ...notifications, push: false });
      toast.success("Push notifications disabled.");
    }
  };

  const handle2FAToggle = async (checked: boolean) => {
    if (!user) return;
    setTwoFactorEnabled(checked);
    const res = await toggle2FA(user.uid, checked);
    if (res.success) {
      toast.success(checked ? "2FA Enabled" : "2FA Disabled");
    } else {
      setTwoFactorEnabled(!checked);
      toast.error("Failed to update 2FA settings");
    }
  };

  const handleRevokeSessions = async () => {
    if (!user) return;
    const res = await revokeAllSessions(user.uid);
    if (res.success) {
      toast.success("All other sessions revoked.");
      fetchSettings();
    } else {
      toast.error("Failed to revoke sessions");
    }
  };

  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = confirm(
      "⚠️ ARE YOU SURE?\n\nThis will permanently delete:\n• Your profile and all personal data\n• All uploaded documents\n• Job posts and applications\n• Chat history\n• Sharing links\n\nThis action CANNOT be undone."
    );
    if (!confirmed) return;

    const doubleConfirm = confirm(
      "FINAL CONFIRMATION\n\nType OK to permanently delete your account. There is no recovery."
    );
    if (!doubleConfirm) return;

    setDeleting(true);
    try {
      const { deleteUserAccount } = await import("@/app/actions/auth");
      const res = await deleteUserAccount(user.uid);
      if (res.success) {
        toast.success("Account deleted successfully. Goodbye!");
        // Sign out from Firebase client-side
        const { signOut } = await import("firebase/auth");
        const { auth } = await import("@/lib/firebase");
        await signOut(auth);
        window.location.href = "/";
      } else {
        toast.error("Failed to delete account", { description: res.error });
      }
    } catch (err: any) {
      toast.error("Error deleting account", { description: err.message || "An unexpected error occurred." });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and security settings.</p>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Choose how you want to be notified about activity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Get instant alerts in your browser.</p>
              </div>
              <Switch 
                checked={notifications.push} 
                onCheckedChange={handlePushToggle} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Protect your account and credentials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication (Email OTP)</Label>
                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
              </div>
              <Switch 
                checked={twoFactorEnabled} 
                onCheckedChange={handle2FAToggle} 
              />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label>Active Sessions</Label>
                  <p className="text-xs text-muted-foreground">Manage devices currently logged into your account.</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRevokeSessions} className="text-destructive">
                  Revoke All Sessions
                </Button>
              </div>
              
              <div className="space-y-3">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active sessions tracked yet.</p>
                ) : (
                  sessions.map((session) => (
                    <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                      <Monitor className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{session.device_info}</p>
                        <p className="text-xs text-muted-foreground">IP: {session.ip_address} • Last Active: {new Date(session.last_active).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              <CardTitle>Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-destructive/80">Permanent actions that cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-destructive">Delete Account</Label>
                <p className="text-xs text-destructive/70">Once deleted, you will lose access to all your data.</p>
              </div>
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount} disabled={deleting}>
                {deleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
