"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, 
  ArrowLeft, 
  Home, 
  LayoutDashboard, 
  HelpCircle, 
  Search,
  Lock,
  FileQuestion
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function NotFound() {
  const { user } = useAuth();
  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary relative overflow-hidden">
      {/* Decorative ambient glowing background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header Bar */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img 
              src={logoUrl} 
              alt="CVVault Official Brand Logo" 
              className="h-8 w-8 rounded-lg object-contain transition-transform group-hover:scale-105" 
            />
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary via-blue-500 to-sky-400 bg-clip-text text-transparent">
              CVVault
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-medium">
              <Link href="/faq">
                <HelpCircle className="h-3.5 w-3.5 mr-1.5" />
                Help & FAQ
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full text-xs font-medium border-primary/30">
              <Link href={user ? "/dashboard" : "/login"}>
                {user ? "Go to Dashboard" : "Sign In"}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main 404 Hero */}
      <main className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-xl mx-auto space-y-8"
        >
          {/* Visual Icon Badge */}
          <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-primary/10 border border-primary/20 rotate-6 transition-transform hover:rotate-12" />
            <div className="absolute inset-0 rounded-3xl bg-card border border-border shadow-xl flex items-center justify-center -rotate-3 transition-transform hover:rotate-0">
              <FileQuestion className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-amber-500 text-white rounded-full shadow-md">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>

          {/* Error Typography */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
              <Lock className="h-3 w-3" /> Error 404 • Vault Location Not Found
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              This credential or page does not exist.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
              The page you are searching for might have been moved, deleted, or requires a valid time-bound access link.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {user ? (
              <Button asChild size="lg" className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 font-semibold h-12 px-6">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Return to Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/20 font-semibold h-12 px-6">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Homepage
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto rounded-xl font-medium h-12 px-6 border-border/80 hover:bg-muted">
              <Link href="/faq">
                <Search className="h-4 w-4 mr-2" />
                Browse FAQs & Knowledge Base
              </Link>
            </Button>
          </div>

          {/* Help Cards */}
          <div className="pt-8 border-t border-border/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <Link 
              href="/faq" 
              className="p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 transition-all group"
            >
              <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                Looking for a Shared Link?
                <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Check expiration times or request a fresh token from the credential owner.
              </p>
            </Link>

            <Link 
              href="/privacy" 
              className="p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/40 transition-all group"
            >
              <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                Privacy & Data Security
                <ArrowLeft className="h-3.5 w-3.5 rotate-180 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Learn how CVVault encrypts and protects career documents.
              </p>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground bg-background/50">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 CVVault Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
