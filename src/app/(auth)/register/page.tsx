"use client";

import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { getPostAuthRedirect } from "@/app/actions/auth";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, User, Cloud, Briefcase, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Google colour SVG ──────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
    <path d="M533.5 278.4c0-17.7-1.6-35.2-4.6-52.1H272v98.7h146.9c-6.3 34.1-25 63.1-53.1 82.5v68h85.7c50.1-46.1 78.9-114 78.9-197.1z" fill="#4285F4"/>
    <path d="M272 544.3c71.9 0 132.1-23.9 176.1-64.8l-85.7-68c-23.6 15.9-53.8 25.2-90.4 25.2-69.5 0-128.4-46.9-149.5-110.1h-90v69.4c44.6 88.1 136.5 148.3 239.5 148.3z" fill="#34A853"/>
    <path d="M122.5 326.6c-10.2-30.2-10.2-62.8 0-93v-69.4h-90c-39.3 77.8-39.3 168.8 0 246.6l90-84.2z" fill="#FBBC05"/>
    <path d="M272 107.5c38.9-.6 76.3 14.9 104.1 42.5l78-78C409.9 20.9 341.9-1.4 272 0c-103 0-194.9 60.2-239.5 148.3l90 84.2C143.6 154.4 202.5 107.5 272 107.5z" fill="#EA4335"/>
  </svg>
);

// ── Feature item ───────────────────────────────────────────────────────────
function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5">
      <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-500 dark:text-indigo-300 shadow-sm">
        {icon}
      </div>
      <p className="text-[11px] font-semibold text-gray-700 dark:text-gray-200 leading-tight">{title}</p>
      <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight">{desc}</p>
    </div>
  );
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  const logoUrl =
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("cvvault_new_registration", "true");
      }
      toast.success("Account created successfully!");
      router.push("/register/role");
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const credential = await signInWithPopup(auth, provider);
      const redirect = await getPostAuthRedirect(credential.user.uid);
      if (redirect.success && redirect.path === "/register/role") {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("cvvault_new_registration", "true");
        }
      }
      toast.success("Signed up with Google!");
      router.push(redirect.success ? redirect.path : "/dashboard");
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Google sign-in failed");
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
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-indigo-200/40 dark:bg-indigo-900/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-violet-200/40 dark:bg-violet-900/20 blur-3xl" />
        {/* Bottom decorative wave blobs matching design */}
        <div className="absolute bottom-0 left-0 w-72 h-48 rounded-tr-full bg-pink-200/40 dark:bg-pink-900/20 blur-2xl" />
        <div className="absolute bottom-0 right-8 w-48 h-32 rounded-tl-full bg-indigo-200/30 dark:bg-indigo-900/20 blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full max-w-[400px]"
      >
        {/* Card */}
        <div className="rounded-3xl bg-white dark:bg-[#1a1a2e] shadow-2xl shadow-indigo-200/50 dark:shadow-indigo-900/40 overflow-hidden">
          <div className="px-8 pt-8 pb-7">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center justify-center gap-2 mb-5">
              <img
                src={logoUrl}
                alt="CVVault"
                className="h-9 w-9 rounded-xl object-cover shadow"
              />
              <span className="text-xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-300">
                CV<span className="text-indigo-500">VAULT</span>
              </span>
            </Link>

            {/* ── Title ── */}
            <div className="text-center mb-5">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create your account</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Start building your professional vault
              </p>
            </div>

            {/* ── 3 Feature icons ── */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <FeatureItem
                icon={<Cloud className="h-5 w-5" />}
                title="Securely store"
                desc="your CVs, certificates and testimonials"
              />
              <FeatureItem
                icon={<Briefcase className="h-5 w-5" />}
                title="Find better jobs"
                desc="discover opportunities that match you"
              />
              <FeatureItem
                icon={<ShieldCheck className="h-5 w-5" />}
                title="Stay in control"
                desc="all your documents, always accessible"
              />
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleRegister} className="space-y-3">
              {/* Full name */}
              <div className="relative">
                <User className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="register-name"
                  type="text"
                  placeholder="Full Name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="register-email"
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
                  id="register-password"
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

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  id="register-confirm-password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Create Account button */}
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm tracking-wide shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all duration-200"
              >
                {loading ? "Creating account…" : "Create Account"}
              </button>
            </form>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              <span className="text-xs text-gray-400 whitespace-nowrap">or sign up with</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            </div>

            {/* ── Social row ── */}
            <div className="grid grid-cols-3 gap-2">
              {/* Google */}
              <button
                id="register-google"
                type="button"
                onClick={handleGoogleRegister}
                disabled={googleLoading}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60"
              >
                <GoogleIcon />
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Google</span>
              </button>

              {/* Microsoft */}
              <button
                type="button"
                disabled
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 opacity-60 cursor-not-allowed"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                  <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                  <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                  <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                </svg>
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Microsoft</span>
              </button>

              {/* Dropbox */}
              <button
                type="button"
                disabled
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 opacity-60 cursor-not-allowed"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 43 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.5 0L0 8.1 8.5 15.3l12.5-7.9L12.5 0z" fill="#0061ff"/>
                  <path d="M0 23.6l12.5 8.1 8.5-7.2-12.5-7.9L0 23.6z" fill="#0061ff"/>
                  <path d="M21 24.5l8.5 7.2L42 23.6l-8.5-7-12.5 7.9z" fill="#0061ff"/>
                  <path d="M42 8.1L29.5 0l-8.5 7.4 12.5 7.9L42 8.1z" fill="#0061ff"/>
                  <path d="M21.1 25.8l-8.6 7.2-3.6-2.4v2.7l12.2 7.3 12.2-7.3v-2.7l-3.6 2.4-8.6-7.2z" fill="#0061ff"/>
                </svg>
                <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">Dropbox</span>
              </button>
            </div>

            {/* ── Footer link ── */}
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
