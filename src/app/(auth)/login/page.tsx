"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
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

// ── Vault illustration (inline SVG matching the design) ───────────────────
const VaultIllustration = () => (
  <div className="relative w-36 h-36 shrink-0">
    {/* Safe body */}
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
      {/* Safe body */}
      <rect x="20" y="30" width="80" height="75" rx="8" fill="#7C6FE1" />
      <rect x="24" y="34" width="72" height="67" rx="6" fill="#9B91EA" />
      {/* Door */}
      <rect x="30" y="40" width="55" height="50" rx="4" fill="#6B5EDA" />
      {/* Dial circle */}
      <circle cx="57" cy="65" r="14" fill="#5449C8" stroke="#E0DEFF" strokeWidth="2" />
      <circle cx="57" cy="65" r="8" fill="#7C6FE1" />
      <line x1="57" y1="57" x2="57" y2="65" stroke="#E0DEFF" strokeWidth="2" strokeLinecap="round"/>
      {/* Handle */}
      <rect x="83" y="60" width="8" height="10" rx="2" fill="#4A3FB0" />
      {/* Hinges */}
      <rect x="28" y="45" width="5" height="7" rx="1" fill="#4A3FB0" />
      <rect x="28" y="75" width="5" height="7" rx="1" fill="#4A3FB0" />
      {/* CV paper sticking out top */}
      <rect x="48" y="20" width="22" height="18" rx="2" fill="white" opacity="0.95"/>
      <line x1="52" y1="26" x2="66" y2="26" stroke="#7C6FE1" strokeWidth="1.5"/>
      <line x1="52" y1="30" x2="66" y2="30" stroke="#7C6FE1" strokeWidth="1.5"/>
      <line x1="52" y1="34" x2="60" y2="34" stroke="#7C6FE1" strokeWidth="1.5"/>
    </svg>
    {/* Floating badge top-right */}
    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center shadow-md border border-indigo-200 dark:border-indigo-700">
      <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </div>
    {/* Floating badge bottom-left */}
    <div className="absolute -bottom-2 -left-2 w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center shadow-md border border-pink-200 dark:border-pink-700">
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
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
    if (!authLoading && user && !showOtpForm) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router, showOtpForm]);

  const logoUrl =
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

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
        setShowOtpForm(true);
        toast.info("2FA Code Sent!", {
          description: `Enter the 6-digit verification code sent to ${credential.user.email}`
        });
      } else {
        const redirect = await getPostAuthRedirect(credential.user.uid);
        toast.success("Logged in successfully!");
        router.push(redirect.success ? redirect.path : "/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
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

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);
      const redirect = await getPostAuthRedirect(credential.user.uid);
      toast.success("Logged in with Google!");
      router.push(redirect.success ? redirect.path : "/dashboard");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
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
        background: "var(--auth-bg, linear-gradient(135deg, #eef2ff 0%, #f5f3ff 50%, #ede9fe 100%))",
      }}
    >
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-violet-200/40 dark:bg-violet-900/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-pink-100/30 dark:bg-pink-900/10 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-[#1a1a2e] shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/40 overflow-hidden">
          <div className="px-8 pt-8 pb-6">

            {/* ── Header: logo + title + illustration ── */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 mb-4 w-fit">
                  <img
                    src={logoUrl}
                    alt="CVVault"
                    className="h-9 w-9 rounded-xl object-cover shadow"
                  />
                  <span className="text-xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-300">
                    CV<span className="text-indigo-500">VAULT</span>
                  </span>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Login to access your professional vault
                </p>
              </div>
              <VaultIllustration />
            </div>

            {/* ── Form ── */}
            {showOtpForm ? (
              <form onSubmit={handleVerifyOtp} className="space-y-3">
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="otp-code"
                    type="text"
                    placeholder="Enter 6-digit OTP code"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm tracking-wide shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all duration-200"
                >
                  {loading ? "Verifying…" : "Verify OTP"}
                </button>
                <p className="text-center text-xs mt-4">
                   <button type="button" onClick={() => setShowOtpForm(false)} className="text-indigo-500 hover:underline">Go back to login</button>
                </p>
              </form>
            ) : (
            <form onSubmit={handleLogin} className="space-y-3">
              {/* Email */}
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-400 accent-indigo-600"
                  />
                  Remember me
                </label>
                <Link
                  href="#"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                id="login-submit"
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm tracking-wide shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all duration-200"
              >
                {loading ? "Signing in…" : "Login"}
              </button>
            </form>
            )}

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 whitespace-nowrap">or continue with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* ── Social button ── */}
            <div className="mt-4">
              <Button
                id="login-google"
                variant="outline"
                type="button"
                className="w-full flex items-center justify-center gap-3 py-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold transition-all shadow-sm"
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
              >
                <GoogleIcon />
                <span>{googleLoading ? "Connecting with Google…" : "Continue with Google"}</span>
              </Button>
            </div>

            {/* ── Footer link ── */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
