"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Lock, Eye, Trash2, Smartphone, ShieldAlert, Monitor, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateFcmToken, toggle2FA, getActiveSessions, revokeAllSessions, getProfileSettings, generateAndSendOtp, verifyOtp } from "@/app/actions/settings";
import { messaging } from "@/lib/firebase";
import { getToken } from "firebase/messaging";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  // 2FA OTP verification state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

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
        const permission = await Notification.requestPermission();
        if (permission === "granted" && messaging) {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });
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

    if (checked) {
      // Enabling 2FA: send OTP first, then verify before enabling
      setOtpSending(true);
      const email = user.email || "";
      const res = await generateAndSendOtp(user.uid, email);
      setOtpSending(false);

      if (res.success) {
        setOtpCode("");
        setOtpDialogOpen(true);
        toast.info("A 6-digit verification code has been sent to your email.");
      } else {
        toast.error("Failed to send verification code", {
          description: res.error || "Could not generate OTP."
        });
      }
    } else {
      // Disabling 2FA: no verification needed
      const res = await toggle2FA(user.uid, false);
      if (res.success) {
        setTwoFactorEnabled(false);
        toast.success("2FA Disabled");
      } else {
        toast.error("Failed to disable 2FA", {
          description: res.error || "Could not save setting."
        });
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (!user || !otpCode.trim()) return;

    setOtpVerifying(true);
    const verifyRes = await verifyOtp(user.uid, otpCode.trim());

    if (verifyRes.success) {
      // OTP verified — now enable 2FA
      const toggleRes = await toggle2FA(user.uid, true);
      setOtpVerifying(false);

      if (toggleRes.success) {
        setTwoFactorEnabled(true);
        setOtpDialogOpen(false);
        setOtpCode("");
        toast.success("2FA Enabled! Your account is now more secure.");
      } else {
        toast.error("OTP verified but failed to enable 2FA", {
          description: toggleRes.error
        });
      }
    } else {
      setOtpVerifying(false);
      toast.error("Invalid verification code", {
        description: verifyRes.error || "Please check the code and try again."
      });
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

    setDeleting(true);
    try {
      const { deleteUserAccount } = await import("@/app/actions/auth");
      const res = await deleteUserAccount(user.uid);

      if (res.success) {
        toast.success("Your account has been permanently deleted.");
        const { getAuth, signOut } = await import("firebase/auth");
        await signOut(getAuth());
        window.location.href = "/login";
      } else {
        toast.error("Failed to delete account", {
          description: res.error || "An unexpected error occurred.",
        });
      }
    } catch (err: any) {
      toast.error("Account deletion failed", {
        description: err?.message || "Please try again later.",
      });
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
                disabled={otpSending}
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
                <p className="text-xs text-destructive/70">Once deleted, all your data, documents, and credentials will be permanently removed.</p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={deleting}>
                    {deleting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    {deleting ? "Deleting..." : "Delete Account"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-destructive flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5" /> Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2 text-sm text-muted-foreground pt-2">
                      <p>This action <strong>cannot be undone</strong>. This will permanently delete your account and remove all associated data, including:</p>
                      <ul className="list-disc list-inside space-y-1 text-foreground/80 pt-1">
                        <li>Your profile and account credentials</li>
                        <li>All uploaded documents and storage files</li>
                        <li>Your job postings and applications</li>
                        <li>Active chat sessions and messages</li>
                        <li>Active profile sharing links</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="pt-4">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Permanently Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2FA OTP Verification Dialog */}
      <Dialog open={otpDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setOtpDialogOpen(false);
          setOtpCode("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Verify Your Identity
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit verification code sent to <strong>{user?.email}</strong> to enable Two-Factor Authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Enter 6-digit code"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && otpCode.length === 6) {
                  handleVerifyOtp();
                }
              }}
            />
            <p className="text-xs text-muted-foreground text-center">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => handle2FAToggle(true)}
                disabled={otpSending}
              >
                {otpSending ? "Sending..." : "Resend code"}
              </button>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setOtpDialogOpen(false); setOtpCode(""); }}>
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyOtp} 
              disabled={otpCode.length !== 6 || otpVerifying}
            >
              {otpVerifying ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</>
              ) : (
                "Verify & Enable 2FA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
