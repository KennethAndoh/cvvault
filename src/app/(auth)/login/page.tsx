"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, getRedirectResult, signInWithCredential } from "firebase/auth";
import { Capacitor } from "@capacitor/core";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getPostAuthRedirect, syncUserProfile } from "@/app/actions/auth";
import Link from "next/link";
import { getProfileSettings, generateAndSendOtp, verifyOtp } from "@/app/actions/settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

// ── Google colour SVG ──────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
    <path d="M533.5 278.4c0-17.7-1.6-35.2-4.6-52.1H272v98.7h146.9c-6.3 34.1-25 63.1-53.1 82.5v68h85.7c50.1-46.1 78.9-114 78.9-197.1z" fill="#4285F4"/>
    <path d="M272 544.3c71.9 0 132.1-23.9 176.1-64.8l-85.7-68c-23.6 15.9-53.8 25.2-90.4 25.2-69.5 0-128.4-46.9-149.5-110.1h-90v69.4c44.6 88.1 136.5 148.3 239.5 148.3z" fill="#34A853"/>
    <path d="M122.5 326.6c-10.2-30.2-10.2-62.8 0-93v-69.4h-90c-39.3 77.8-39.3 168.8 0 246.6l90-84.2z" fill="#FBBC05"/>
    <path d="M272 107.5c38.9-.6 76.3 14.9 104.1 42.5l78-78C409.9 20.9 341.9-1.4 272 0c-103 0-194.9 60.2-239.5 148.3l90 84.2C143.6 154.4 202.5 107.5 272 107.5z" fill="#EA4335"/>
  </svg>
);

// ── Pryvault Vault illustration ───────────────────────────────────────────
const VaultIllustration = () => (
  <div className="relative w-36 h-36 shrink-0">
    {/* Safe body */}
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
      {/* Safe body */}
      <rect x="20" y="30" width="80" height="75" rx="10" fill="#0284C7" />
      <rect x="24" y="34" width="72" height="67" rx="8" fill="#38BDF8" />
      {/* Door */}
      <rect x="30" y="40" width="55" height="50" rx="6" fill="#0369A1" />
      {/* Dial circle */}
      <circle cx="57" cy="65" r="14" fill="#0284C7" stroke="#E0F2FE" strokeWidth="2.5" />
      <circle cx="57" cy="65" r="8" fill="#0369A1" />
      <line x1="57" y1="57" x2="57" y2="65" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round"/>
      {/* Handle */}
      <rect x="83" y="60" width="8" height="10" rx="2" fill="#0C4A6E" />
      {/* Hinges */}
      <rect x="28" y="45" width="5" height="7" rx="1.5" fill="#0C4A6E" />
      <rect x="28" y="75" width="5" height="7" rx="1.5" fill="#0C4A6E" />
      {/* CV credential paper sticking out top */}
      <rect x="48" y="20" width="22" height="18" rx="2" fill="white" opacity="0.98"/>
      <line x1="52" y1="26" x2="66" y2="26" stroke="#0284C7" strokeWidth="1.5"/>
      <line x1="52" y1="30" x2="66" y2="30" stroke="#0284C7" strokeWidth="1.5"/>
      <line x1="52" y1="34" x2="60" y2="34" stroke="#0284C7" strokeWidth="1.5"/>
    </svg>
    {/* Floating verified badge top-right */}
    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center shadow-md border border-sky-200 dark:border-sky-800">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-600 dark:text-sky-400" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
    {/* Floating golden padlock badge bottom-left (matching the Pryvault logo) */}
    <div className="absolute -bottom-2 -left-2 w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center shadow-md border border-amber-300 dark:border-amber-700">
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2.2">
        <rect x="5" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
        <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
      </svg>
    </div>
  </div>
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempUser, setTempUser] = useState<{uid: string, email: string} | null>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  React.useEffect(() => {
    getRedirectResult(auth).then(async (credential) => {
      if (credential?.user) {
        await syncUserProfile(credential.user.uid, credential.user.email ?? "", credential.user.displayName ?? "");
        const redirect = await getPostAuthRedirect(credential.user.uid);
        toast.success("Logged in with Google!");
        router.push(redirect.success ? redirect.path : "/dashboard");
      }
    }).catch((err) => {
      if (err.code !== "auth/missing-initial-state") {
        console.error("Google redirect result error:", err);
      }
    });
  }, [router]);

  React.useEffect(() => {
    if (!authLoading && user && !showOtpForm) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router, showOtpForm]);

  const logoUrl = "/logo.png";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await syncUserProfile(credential.user.uid, credential.user.email ?? "", credential.user.displayName ?? "");
      
      const res = await getProfileSettings(credential.user.uid);
      if (res.success && res.settings?.two_factor_enabled) {
        setTempUser({ uid: credential.user.uid, email: credential.user.email || "" });
        const otpRes = await generateAndSendOtp(credential.user.uid, credential.user.email || "");
        if (otpRes.success) {
          setShowOtpForm(true);
          toast.info("2FA code sent to your email.");
        } else {
          toast.error(otpRes.error || "Failed to send 2FA OTP.");
        }
      } else {
        const redirect = await getPostAuthRedirect(credential.user.uid);
        toast.success("Logged in successfully!");
        router.push(redirect.success ? redirect.path : "/dashboard");
      }
    } catch (error: any) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUser) return;
    setLoading(true);
    try {
      const res = await verifyOtp(tempUser.uid, otp);
      if (res.success) {
        const redirect = await getPostAuthRedirect(tempUser.uid);
        toast.success("Logged in successfully!");
        router.push(redirect.success ? redirect.path : "/dashboard");
      } else {
        toast.error(res.error || "Invalid OTP");
      }
    } catch (error: any) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      GoogleAuth.initialize({
        clientId: "666493076753-web.apps.googleusercontent.com",
        scopes: ["profile", "email"],
        grantOfflineAccess: true,
      }).catch((err: any) => console.log("GoogleAuth init warning:", err));
    }
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          await GoogleAuth.initialize({
            clientId: "666493076753-web.apps.googleusercontent.com",
            scopes: ["profile", "email"],
            grantOfflineAccess: true,
          });
          const googleUser = await GoogleAuth.signIn();
          const idToken = googleUser.authentication.idToken;
          if (idToken) {
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);

            await syncUserProfile(userCredential.user.uid, userCredential.user.email ?? "", userCredential.user.displayName ?? "");
            const redirect = await getPostAuthRedirect(userCredential.user.uid);
            toast.success("Logged in with Google!");
            router.push(redirect.success ? redirect.path : "/dashboard");
            return;
          }
        } catch (nativeErr: any) {
          console.warn("Native GoogleAuth failed, falling back to Web OAuth:", nativeErr);
        }
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);
      await syncUserProfile(credential.user.uid, credential.user.email ?? "", credential.user.displayName ?? "");
      const redirect = await getPostAuthRedirect(credential.user.uid);
      toast.success("Logged in with Google!");
      router.push(redirect.success ? redirect.path : "/dashboard");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user" && error.code !== "auth/cancelled-popup-request") {
        toast.error(error.message || "Google login failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: "var(--auth-bg, linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%))",
      }}
    >
      {/* Background blobs matching Pryvault theme */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-sky-300/30 dark:bg-sky-900/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-blue-300/30 dark:bg-blue-900/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-200/20 dark:bg-amber-900/10 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-[#0f172a] shadow-2xl shadow-sky-900/10 dark:shadow-black/60 border border-sky-100 dark:border-slate-800 overflow-hidden">
          <div className="px-8 pt-8 pb-6">

            {/* ── Header: logo + title + illustration ── */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 mb-4 w-fit">
                  <img
                    src={logoUrl}
                    alt="Pryvault Official Brand Logo"
                    className="h-9 w-9 rounded-xl object-contain shadow-sm"
                  />
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Pry<span className="text-sky-600 dark:text-sky-400">vault</span>
                  </span>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Login to access your professional vault
                </p>
              </div>
              <VaultIllustration />
            </div>

            {/* ── Form ── */}
            {showOtpForm ? (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="otp-code"
                    type="text"
                    placeholder="Enter 6-digit OTP code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:from-sky-700 active:to-blue-700 disabled:opacity-60 text-white font-semibold text-sm tracking-wide shadow-lg shadow-sky-500/25 transition-all duration-200"
                >
                  {loading ? "Verifying…" : "Verify OTP"}
                </button>
                <p className="text-center text-xs mt-4">
                   <button type="button" onClick={() => setShowOtpForm(false)} className="text-sky-600 dark:text-sky-400 hover:underline">Go back to login</button>
                </p>
              </form>
            ) : (
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email */}
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 accent-sky-600"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                id="login-submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:from-sky-700 active:to-blue-700 disabled:opacity-60 text-white font-semibold text-sm tracking-wide shadow-lg shadow-sky-500/25 transition-all duration-200"
              >
                {loading ? "Signing in…" : "Login"}
              </button>
            </form>
            )}

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              <span className="text-xs text-slate-400 whitespace-nowrap">or continue with</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* ── Social button ── */}
            <div className="mt-4">
              <Button
                id="login-google"
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-3 py-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-all shadow-sm hover:border-sky-300 dark:hover:border-sky-600"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
              >
                <GoogleIcon />
                <span>{googleLoading ? "Connecting with Google…" : "Continue with Google"}</span>
              </Button>
            </div>

            {/* ── Footer link ── */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>

            <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-4">
              By continuing, you agree to our{" "}
              <Link href="/privacy" className="underline hover:text-sky-600 dark:hover:text-sky-400">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/faq" className="underline hover:text-sky-600 dark:hover:text-sky-400">
                FAQ
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
