"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  HelpCircle, 
  ShieldCheck, 
  FileText, 
  Share2, 
  Smartphone, 
  Briefcase, 
  Lock, 
  ChevronDown,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Home,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";

interface FAQItem {
  id: string;
  category: "general" | "security" | "documents" | "sharing" | "employers" | "mobile";
  question: string;
  answer: string;
  tags: string[];
}

const FAQ_CATEGORIES = [
  { id: "all", label: "All Questions", icon: HelpCircle },
  { id: "general", label: "General", icon: Sparkles },
  { id: "security", label: "Security & Encryption", icon: ShieldCheck },
  { id: "documents", label: "Documents & OCR", icon: FileText },
  { id: "sharing", label: "Sharing & QR Codes", icon: Share2 },
  { id: "employers", label: "For Employers", icon: Briefcase },
  { id: "mobile", label: "Mobile App", icon: Smartphone },
] as const;

export const FAQ_DATA: FAQItem[] = [
  {
    id: "what-is-cvvault",
    category: "general",
    question: "What is CVVault?",
    answer: "CVVault is a secure, professional SaaS platform for storing, organizing, verifying, and sharing career credentials. It gives professionals complete ownership of their resumes, degree certificates, licenses, and transcripts while providing employers with instant, verifiable proof of qualifications.",
    tags: ["overview", "about", "platform", "purpose"]
  },
  {
    id: "is-cvvault-free",
    category: "general",
    question: "Is CVVault free to use for job seekers?",
    answer: "Yes! CVVault offers a full-featured Free Tier for individual candidates and employees. You can upload your CVs, certificates, generate secure time-limited sharing links, export verifiable QR codes, and showcase your verified public profile at no cost.",
    tags: ["pricing", "cost", "free tier", "candidate"]
  },
  {
    id: "how-secure-are-documents",
    category: "security",
    question: "How are my documents and sensitive credentials secured?",
    answer: "All files uploaded to CVVault are encrypted both at rest using military-grade AES-256 encryption and in transit via TLS 1.3. Documents are stored in secure S3-compatible cloud storage buckets with strict Row-Level Security (RLS) policies. Only you and the specific individuals you share time-bound tokens with can view your files.",
    tags: ["security", "encryption", "privacy", "aes-256", "safety"]
  },
  {
    id: "zero-knowledge-sharing",
    category: "security",
    question: "What happens when I share a credential link?",
    answer: "When you share a document or your vault, CVVault generates a cryptographically signed, restricted-access token. You can configure precise expiration limits (e.g., 24 hours, 7 days, 30 days) or max view counts. Once expired or manually revoked, the link immediately ceases to work, preventing unauthorized forwarding or permanent copies.",
    tags: ["token", "expiration", "revoke", "access control"]
  },
  {
    id: "supported-file-formats",
    category: "documents",
    question: "What document formats and file sizes are supported?",
    answer: "CVVault supports PDF, Microsoft Word (.docx, .doc), and high-resolution image formats (JPEG, PNG, WEBP) up to 25MB per document. We also support direct camera capture and native Android file pickers.",
    tags: ["file types", "pdf", "docx", "images", "size limit"]
  },
  {
    id: "ocr-auto-parsing",
    category: "documents",
    question: "How does the OCR Auto-Parsing Engine work?",
    answer: "When you drop or select a document, our client-side OCR parsing engine instantly analyzes the document header and body text. It detects issuing authorities (e.g., AWS, Stanford, Microsoft), credential categories, issue dates, and relevant industry skills to auto-populate your vault metadata in milliseconds without sending unencrypted data over public networks.",
    tags: ["ocr", "skills", "auto-parsing", "extraction"]
  },
  {
    id: "document-verification-status",
    category: "documents",
    question: "What do the document verification statuses mean?",
    answer: "Documents in CVVault display three verification states: Pending (document uploaded and undergoing automated checksum / moderation review), Verified (credential verified with cryptographic seal and audit record), and Rejected (document could not be validated or requires re-upload).",
    tags: ["verification", "badge", "status", "audit"]
  },
  {
    id: "qr-code-sharing",
    category: "sharing",
    question: "How do QR codes work for physical resumes and business cards?",
    answer: "Every document and public profile has an instant QR code generator in CVVault. You can print or download the standalone QR badge onto physical resumes, portfolios, or business cards. When recruiters scan the QR code with their phone camera, they are routed to your verified credential proof page without needing to sign up.",
    tags: ["qr code", "print", "mobile scan", "business card"]
  },
  {
    id: "employer-features",
    category: "employers",
    question: "What features does CVVault offer to recruiters and employers?",
    answer: "Employers can post jobs, manage candidate applications through an interactive Kanban pipeline (Applied → Shortlisted → Interviewing → Offered → Hired), calculate AI Candidate Match Scores, review verified credentials with live preview zooms, and initiate real-time direct chats with applicants.",
    tags: ["recruiter", "jobs", "kanban", "match score", "hiring"]
  },
  {
    id: "ai-match-score",
    category: "employers",
    question: "How is the AI Match Score calculated?",
    answer: "The AI Match Score analyzes required job skills, verified credential authentications, relevant work experience, and candidate profile summaries against the job description to calculate a normalized fit score (0-100%) highlighting skill matches and gaps.",
    tags: ["ai", "score", "match", "skills gap", "analysis"]
  },
  {
    id: "android-app-support",
    category: "mobile",
    question: "Is there a native mobile app for Android?",
    answer: "Yes! CVVault is available as an Android application powered by Capacitor. It includes offline status detection, native file and camera document pickers, push notifications for job updates and verification events, and responsive dark/light mode themes.",
    tags: ["android", "mobile", "capacitor", "notifications", "app"]
  },
  {
    id: "offline-mode",
    category: "mobile",
    question: "Can I use CVVault when offline or with poor network connectivity?",
    answer: "CVVault includes automatic network status detection. If you lose connection, cached credentials remain accessible and an offline status banner allows you to retry connection with one tap. Any document uploads will resume once internet connection is restored.",
    tags: ["offline", "network", "cache", "connectivity"]
  }
];

export default function FAQPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "what-is-cvvault": true,
    "how-secure-are-documents": true,
  });

  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  const toggleItem = (id: string) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((faq) => {
      const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesQuery = 
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Navigation Header */}
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
            {user ? (
              <Button asChild size="sm" className="rounded-full text-xs font-semibold">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="rounded-full text-xs font-medium">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="rounded-full text-xs font-semibold">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main FAQ Content */}
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-4xl flex-1">
        {/* Header Title Section */}
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="h-3.5 w-3.5" /> Help Center & Knowledge Base
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Everything you need to know about credentials security, document verification, sharing, and recruitment features on CVVault.
          </p>

          {/* Search Input Bar */}
          <div className="pt-4 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, e.g. encryption, OCR, QR code, pricing..."
              className="pl-11 pr-4 h-12 rounded-2xl bg-card border-border/80 shadow-xs text-sm focus-visible:ring-primary"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-[1.02]"
                    : "bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = !!openItems[faq.id];
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isOpen 
                      ? "border-primary/40 bg-card shadow-md shadow-primary/5" 
                      : "border-border/60 bg-card/60 hover:border-border hover:bg-card"
                  }`}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-semibold text-sm md:text-base text-foreground focus:outline-hidden"
                  >
                    <span className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary/60 shrink-0" />
                      {faq.question}
                    </span>
                    <ChevronDown 
                      className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`} 
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5 pt-1 text-sm text-muted-foreground leading-relaxed border-t border-border/30">
                          {faq.answer}
                          <div className="flex gap-1.5 flex-wrap pt-3">
                            {faq.tags.map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground font-medium">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 p-6 rounded-2xl border border-dashed border-border bg-card/30 space-y-3">
              <Search className="h-8 w-8 text-muted-foreground mx-auto" />
              <h3 className="font-semibold text-foreground">No matching questions found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We could not find any FAQ items matching &quot;{searchQuery}&quot;. Try another term or contact our support team.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                className="mt-2 text-xs rounded-xl"
              >
                Reset Search Filters
              </Button>
            </div>
          )}
        </div>

        {/* Contact Support Banner */}
        <div className="mt-14 p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-card to-background border border-primary/20 shadow-lg text-center space-y-4">
          <div className="p-3 bg-primary/10 text-primary w-fit mx-auto rounded-full">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Still have questions?</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Our support and credential verification team is here to assist you 24/7 with account, security, or enterprise inquiries.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="rounded-full shadow-md px-6">
              <Link href="/register">
                Get Started Free <ArrowRight className="h-4 w-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link href="/privacy">
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                Read Privacy Policy
              </Link>
            </Button>
          </div>
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
            <Link href="/faq" className="text-primary font-semibold">FAQ</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
