"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Eye, 
  Database, 
  Server, 
  Trash2, 
  CheckCircle2, 
  ArrowLeft,
  Mail,
  Home,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ModeToggle } from "@/components/mode-toggle";

export default function PrivacyPolicyPage() {
  const { user } = useAuth();
  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";
  const lastUpdated = "August 14, 2026";

  const sections = [
    { id: "overview", title: "1. Overview & Core Privacy Principles" },
    { id: "information-collected", title: "2. Information We Collect" },
    { id: "how-we-use", title: "3. How We Use & Protect Your Data" },
    { id: "encryption-security", title: "4. Military-Grade Encryption & Vault Security" },
    { id: "sharing-controls", title: "5. Tokenized Sharing & Access Expiration" },
    { id: "infrastructure", title: "6. Cloud Infrastructure & Sub-processors" },
    { id: "user-rights", title: "7. Your Rights (GDPR, CCPA & Data Deletion)" },
    { id: "cookies", title: "8. Cookies & Local Storage" },
    { id: "contact", title: "9. Contact Data Protection Officer" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary relative">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header */}
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
            <ModeToggle />
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-medium">
              <Link href="/faq">FAQ</Link>
            </Button>
            {user ? (
              <Button asChild size="sm" className="rounded-full text-xs font-semibold">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="rounded-full text-xs font-semibold">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-4xl flex-1">
        {/* Title Header */}
        <div className="space-y-4 mb-10 pb-8 border-b border-border/50">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" /> Legal & Data Protection Compliance
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            At CVVault, your career credentials and professional identity are your private property. We are committed to absolute transparency and data sovereignty.
          </p>
          <div className="text-xs text-muted-foreground">
            <strong>Effective Date:</strong> {lastUpdated} • <strong>Version:</strong> 2.4 (Enterprise & Mobile Edition)
          </div>
        </div>

        {/* Quick Navigation Box */}
        <div className="p-6 rounded-2xl border border-border/70 bg-card/60 mb-12">
          <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" /> Table of Contents
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-muted-foreground hover:text-primary transition-colors py-1 hover:underline"
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Policy Body */}
        <div className="space-y-12 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section id="overview" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-xs font-mono">01</span>
              Overview & Core Privacy Principles
            </h2>
            <p>
              CVVault Inc. (&quot;CVVault&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates the CVVault web application, mobile applications, and credential verification infrastructure. This Privacy Policy outlines how we collect, process, encrypt, and safeguard the career documents and credentials you entrust to our platform.
            </p>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <strong className="text-foreground text-xs uppercase tracking-wider block">Our Fundamental Guarantees:</strong>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Zero Third-Party Data Monetization:</strong> We never sell, rent, or trade your resumes, credentials, or personal contact info to data brokers or advertising networks.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Granular Revocation:</strong> You retain complete control over sharing links with absolute instant revocation powers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Full Data Portability & Deletion:</strong> You can export your credential records or permanently purge your account at any time.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2 */}
          <section id="information-collected" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-xs font-mono">02</span>
              Information We Collect
            </h2>
            <p>We collect only the information strictly necessary to provide secure vault storage, verification proofing, and employer recruitment services:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Account Credentials:</strong> Email address, Firebase Authentication UID, hashed passwords (managed securely via Google Firebase Identity).</li>
              <li><strong>Vault Documents:</strong> Resumes/CVs, university degree certificates, national identity proofs, professional accreditations, and cover letters uploaded in PDF, DOCX, or image formats.</li>
              <li><strong>OCR Metadata:</strong> Document titles, detected issuing organizations, graduation/accreditation dates, and extracted professional skill tags.</li>
              <li><strong>Recruiter Interactions:</strong> Job applications submitted, match score evaluations, and direct chat messages exchanged with hiring managers.</li>
              <li><strong>Audit & Security Logs:</strong> Immutable timestamps, client IP location approximations, and action types (Upload, View, Share, Delete) for security auditing.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section id="how-we-use" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-xs font-mono">03</span>
              How We Use & Process Your Data
            </h2>
            <p>Your information is utilized solely for authorized service delivery:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li>To store, organize, and generate secure preview representations of your documents.</li>
              <li>To compute AI Candidate Match Scores and skills gap comparisons against employer job descriptions.</li>
              <li>To generate cryptographic verification hashes confirming document integrity to recruiters without exposing private unshared documents.</li>
              <li>To dispatch transactional alerts, verification confirmations, and real-time messaging notifications.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section id="encryption-security" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-xs font-mono">04</span>
              Military-Grade Encryption & Vault Security
            </h2>
            <p>
              Security is our core architectural pillar. All documents in CVVault are guarded by multiple layers of enterprise encryption:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground mb-1">
                  <Lock className="h-4 w-4 text-blue-500" /> Encryption at Rest (AES-256)
                </div>
                <p className="text-xs text-muted-foreground">
                  All storage blocks and PostgreSQL database rows are encrypted with AES-256 bit keys with automated key rotation.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground mb-1">
                  <Server className="h-4 w-4 text-sky-500" /> In-Transit Security (TLS 1.3)
                </div>
                <p className="text-xs text-muted-foreground">
                  All network transmissions between your browser/mobile app and our API utilize HTTPS and strict TLS 1.3 encryption.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section id="sharing-controls" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-xs font-mono">05</span>
              Tokenized Sharing & Access Expiration
            </h2>
            <p>
              When you generate a shared link or QR code, CVVault creates a cryptographically signed token. You have the right to set access durations (e.g. 24 hours, 7 days, 30 days) or revoke tokens on-demand. When a link expires, all future access attempts receive an immediate 404 response.
            </p>
          </section>

          {/* Section 6 */}
          <section id="infrastructure" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-xs font-mono">06</span>
              Cloud Infrastructure & Sub-processors
            </h2>
            <p>
              CVVault partners with industry-leading, SOC 2 Type II compliant infrastructure providers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Supabase (PostgreSQL & Storage):</strong> Encrypted database records, row-level security, and private object buckets.</li>
              <li><strong>Firebase (Google Cloud):</strong> Identity authentication, secure session tokens, and push notification relays.</li>
              <li><strong>Resend:</strong> Secure transactional email dispatch for account verification.</li>
              <li><strong>Novu:</strong> In-app notification event orchestration.</li>
            </ul>
          </section>

          {/* Section 7 */}
          <section id="user-rights" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-xs font-mono">07</span>
              Your Rights (GDPR, CCPA & Data Deletion)
            </h2>
            <p>
              Under global data privacy laws including the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you retain the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-muted-foreground">
              <li><strong>Access & Export:</strong> Download all your documents and verification records in standard formats.</li>
              <li><strong>Rectification:</strong> Modify your profile, resume details, and metadata at any time.</li>
              <li><strong>Right to Erasure (Permanent Vault Deletion):</strong> When you delete a document or delete your account, files are immediately purged from both database records and storage buckets.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section id="cookies" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-xs font-mono">08</span>
              Cookies & Local Storage
            </h2>
            <p>
              We use strictly necessary cookies and browser local storage solely to preserve your active authentication session, theme preferences (Dark/Light mode), and cached offline credentials. We do not use third-party cross-site tracking cookies.
            </p>
          </section>

          {/* Section 9 */}
          <section id="contact" className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary text-xs font-mono">09</span>
              Contact Data Protection Officer
            </h2>
            <p>
              If you have any questions, inquiries regarding your privacy rights, or data deletion requests, please contact our Data Protection Officer:
            </p>
            <div className="p-4 rounded-xl border border-border bg-card/80 space-y-2 text-xs">
              <p><strong>CVVault Data Protection Office</strong></p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>privacy@cvvault.app • support@cvvault.app</span>
              </p>
              <p className="text-muted-foreground">Response SLA: Within 48 hours for all data subject requests.</p>
            </div>
          </section>
        </div>

        {/* Back navigation */}
        <div className="mt-14 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button asChild variant="outline" className="rounded-full text-xs">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Homepage
            </Link>
          </Button>
          <Button asChild className="rounded-full text-xs font-semibold">
            <Link href="/faq">
              Browse Frequently Asked Questions
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-muted/20 text-xs text-muted-foreground text-center">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="CVVault Logo" className="h-6 w-6 rounded-md" />
            <span className="font-bold text-foreground">CVVault</span>
            <span>• Verified Career Credentials</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
            <Link href="/privacy" className="text-primary font-semibold">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
