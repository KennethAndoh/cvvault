"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Share2,
  FolderLock,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Lock,
  Menu,
  Sparkles,
  Zap,
  Users,
  ChevronRight,
  Globe,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationBubble } from "@/components/NotificationBubble";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function LandingPage() {
  const logoUrl =
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const features = [
    {
      icon: Shield,
      title: "Military-Grade Security",
      desc: "Your documents are encrypted at rest and in transit. Only you hold the keys to your professional vault.",
      color: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-500",
    },
    {
      icon: Share2,
      title: "Smart Sharing",
      desc: "Generate secure, time-limited access tokens for recruiters. Revoke access at any time with one click.",
      color: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-500",
    },
    {
      icon: FolderLock,
      title: "Advanced Organization",
      desc: "Categorize documents by type, date, or custom tags. Find what you need in seconds with global search.",
      color: "from-cyan-500/20 to-blue-500/20",
      iconColor: "text-cyan-500",
    },
  ];

  const stats = [
    { value: "5,000+", label: "Professionals", icon: Users },
    { value: "99.9%", label: "Uptime SLA", icon: TrendingUp },
    { value: "256-bit", label: "Encryption", icon: ShieldCheck },
    { value: "50+", label: "Countries", icon: Globe },
  ];

  const profileChecklist = [
    "Customizable vanity URLs (cvvault.com/p/yourname)",
    "One-click verification for recruiters",
    "Granular document-level permission control",
    "Activity logs showing who viewed your documents",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-x-hidden">
      {/* ── HEADER ── */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "glass border-b shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link className="flex items-center gap-2.5 group" href="/">
            <img
              src={logoUrl}
              alt="CVVault Logo"
              className="h-9 w-9 rounded-xl shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md glow-sm"
            />
            <span className="text-xl font-bold tracking-tight gradient-text">
              CVVault
            </span>
          </Link>

          <nav className="hidden md:flex gap-8 items-center">
            {["Features", "Pricing", "Security"].map((item) => (
              <Link
                key={item}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                href={`#${item.toLowerCase()}`}
              >
                {item}
              </Link>
            ))}
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              href="/login"
            >
              Login
            </Link>
            <ModeToggle />
            <Button asChild className="rounded-full px-5 h-9 text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-primary/40 transition-shadow">
              <Link href="/register">Get Started <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] glass">
                <SheetHeader className="text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded-lg" />
                    <span className="gradient-text">CVVault</span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-3 mt-8">
                  {["#features", "#pricing", "#security", "/login"].map((href, i) => (
                    <Link
                      key={i}
                      className="text-base font-medium py-2 px-3 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                      href={href}
                    >
                      {["Features", "Pricing", "Security", "Login"][i]}
                    </Link>
                  ))}
                  <Button asChild className="rounded-full w-full mt-4">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* ── HERO ── */}
        <section className="relative w-full min-h-screen flex items-center py-20 lg:py-0 overflow-hidden">
          {/* Background orbs */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-[15%] right-[8%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] animate-pulse [animation-delay:1s]" />
            <div className="absolute top-[40%] left-[35%] w-[300px] h-[300px] bg-cyan-500/8 rounded-full blur-[80px]" />
          </div>

          {/* Grid pattern */}
          <div
            className="absolute inset-0 -z-10 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(0,0,0)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
            }}
          />

          <div className="container px-4 mx-auto">
            <motion.div
              className="text-center max-w-5xl mx-auto"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              {/* Badge */}
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 shadow-sm shadow-primary/10">
                <Sparkles className="h-3.5 w-3.5 fill-primary" />
                <span>THE MOST TRUSTED PROFESSIONAL VAULT</span>
              </motion.div>

              {/* Headline */}
              <motion.h1 variants={fadeUp} custom={1} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.9] max-w-4xl mx-auto">
                Your Career,{" "}
                <span className="gradient-text">Vaulted.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
                Store, organize, and share your career credentials with military-grade security. Built for professionals who value data privacy.
              </motion.p>

              {/* CTAs */}
              <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  asChild
                  size="lg"
                  className="h-14 px-8 text-base rounded-full shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105 transition-all duration-200 font-semibold group"
                >
                  <Link href="/register">
                    Create Your Free Vault
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-base rounded-full border-border/70 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200"
                  asChild
                >
                  <Link href="#features">Explore Features</Link>
                </Button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div variants={fadeUp} custom={4} className="flex items-center justify-center gap-6 mt-10 text-xs text-muted-foreground">
                {["No credit card needed", "Free during early access", "256-bit encrypted"].map((t, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Dashboard mock */}
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-20 relative max-w-5xl mx-auto"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-violet-500/20 to-cyan-500/20 rounded-3xl blur-xl" />
              <div className="relative rounded-2xl overflow-hidden border border-primary/20 shadow-2xl glass-card">
                {/* Mock browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-4 h-6 rounded-md bg-muted/60 flex items-center px-3">
                    <span className="text-[11px] text-muted-foreground font-mono">cvvault.com/dashboard</span>
                  </div>
                  <Lock className="h-3.5 w-3.5 text-green-500" />
                </div>

                {/* Mock dashboard content */}
                <div className="grid grid-cols-12 min-h-[360px]">
                  {/* Sidebar mock */}
                  <div className="col-span-2 border-r border-border/50 bg-muted/20 p-3 hidden sm:flex flex-col gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 mb-3" />
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-7 rounded-lg ${i === 0 ? "bg-primary/20" : "bg-muted/50"} animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>

                  {/* Main mock */}
                  <div className="col-span-12 sm:col-span-10 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {[
                        { label: "Documents", color: "from-blue-500/20 to-blue-600/10" },
                        { label: "Verified", color: "from-green-500/20 to-green-600/10" },
                        { label: "Shared", color: "from-violet-500/20 to-violet-600/10" },
                        { label: "Views", color: "from-orange-500/20 to-orange-600/10" },
                      ].map((card, i) => (
                        <div key={i} className={`rounded-xl bg-gradient-to-br ${card.color} border border-border/40 p-3`}>
                          <div className="h-2 w-12 bg-muted rounded animate-pulse mb-2" />
                          <div className="h-6 w-8 bg-muted rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 rounded-xl border border-border/40 bg-card/30 p-4">
                        <div className="h-3 w-24 bg-muted rounded animate-pulse mb-4" />
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center gap-3 mb-3">
                            <div className="h-8 w-8 rounded-lg bg-primary/15 shrink-0 animate-pulse" />
                            <div className="flex-1 space-y-1.5">
                              <div className="h-2.5 bg-muted rounded animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                              <div className="h-2 w-2/3 bg-muted/60 rounded animate-pulse" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl border border-border/40 bg-card/30 p-4 flex flex-col gap-2">
                        <div className="h-3 w-20 bg-muted rounded animate-pulse mb-2" />
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-8 rounded-lg bg-muted/40 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="w-full py-16 border-y border-border/50 bg-muted/20">
          <div className="container px-4 mx-auto">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              {stats.map((stat, i) => (
                <motion.div key={i} variants={fadeUp} custom={i} className="text-center group">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-3 mx-auto group-hover:scale-110 transition-transform">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="w-full py-28">
          <div className="container px-4 mx-auto">
            <motion.div
              className="text-center max-w-2xl mx-auto mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
                <Zap className="h-3 w-3" />
                POWERFUL FEATURES
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-black mb-5 leading-tight">
                Built for{" "}
                <span className="gradient-text">Modern Careers</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg leading-relaxed">
                CVVault simplifies how you manage your professional documents with powerful, intuitive tools designed for the future of work.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i}
                  className="group relative p-8 rounded-3xl border border-border/60 bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 card-premium overflow-hidden"
                >
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl`} />

                  <div className="relative">
                    <div className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${feature.color} border border-border/40 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className={`h-7 w-7 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
                    <div className="mt-6 flex items-center gap-1 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn more <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="w-full py-28 relative overflow-hidden border-t border-border/40">
          <div className="container px-4 mx-auto">
            <motion.div
              className="text-center max-w-2xl mx-auto mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6">
                <Sparkles className="h-3 w-3" />
                TRANSPARENT PRICING
              </motion.div>
              <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-black mb-5 leading-tight">
                Free Today, <span className="gradient-text">Built for Scale</span>
              </motion.h2>
              <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg leading-relaxed">
                CVVault is currently free during early access. As the platform matures, optional paid plans will be introduced for advanced features and corporate hiring.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={staggerContainer}
            >
              {/* Early Access / Free Plan */}
              <motion.div variants={fadeUp} custom={0} className="relative rounded-3xl border-2 border-primary bg-card p-8 shadow-xl flex flex-col justify-between card-premium">
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
                  ACTIVE PLAN
                </div>
                <div>
                  <div className="text-xl font-bold mb-2">Early Access</div>
                  <p className="text-xs text-muted-foreground mb-6">100% free for all users during current Beta.</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-5xl font-black">$0</span>
                    <span className="text-sm text-muted-foreground">/ month</span>
                  </div>
                  <ul className="space-y-3 text-sm mb-8">
                    {[
                      "Unlimited Document Vault Storage",
                      "Smart Sharing Links with Expiration",
                      "Automated Credential Verification",
                      "Vanity Profile URL (cvvault.com/p/you)",
                      "Full Activity Auditing & Access Logs",
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button asChild className="w-full rounded-full h-11 font-semibold">
                  <Link href="/register">Get Started Free</Link>
                </Button>
              </motion.div>

              {/* Pro Plan (Coming Soon) */}
              <motion.div variants={fadeUp} custom={1} className="relative rounded-3xl border border-border/70 bg-card/60 p-8 flex flex-col justify-between opacity-95">
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-semibold">
                  COMING SOON
                </div>
                <div>
                  <div className="text-xl font-bold mb-2">Pro Professional</div>
                  <p className="text-xs text-muted-foreground mb-6">Designed for advanced job seekers and freelancers.</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-muted-foreground">$9</span>
                    <span className="text-sm text-muted-foreground">/ month (planned)</span>
                  </div>
                  <ul className="space-y-3 text-sm mb-8">
                    {[
                      "Everything in Early Access",
                      "Custom Domain Support",
                      "Advanced View Analytics & Heatmaps",
                      "Priority AI Credential Verification",
                      "Password-Protected Shared Links",
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary/60 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" disabled className="w-full rounded-full h-11 font-semibold">
                  Paid Tier Coming Soon
                </Button>
              </motion.div>

              {/* Employer / Enterprise Plan (Coming Soon) */}
              <motion.div variants={fadeUp} custom={2} className="relative rounded-3xl border border-border/70 bg-card/60 p-8 flex flex-col justify-between opacity-95">
                <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground text-xs font-semibold">
                  COMING SOON
                </div>
                <div>
                  <div className="text-xl font-bold mb-2">Employer & Teams</div>
                  <p className="text-xs text-muted-foreground mb-6">For recruiters, HR teams, and business hiring.</p>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-4xl font-black text-muted-foreground">$29</span>
                    <span className="text-sm text-muted-foreground">/ seat / month (planned)</span>
                  </div>
                  <ul className="space-y-3 text-sm mb-8">
                    {[
                      "Candidate Credential Search",
                      "Bulk Verification Reports & Export",
                      "Multi-user Team Permission Controls",
                      "ATS & HRIS System Integration",
                      "Dedicated Account Manager",
                    ].map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-primary/60 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button variant="outline" disabled className="w-full rounded-full h-11 font-semibold">
                  Employer Tier Coming Soon
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── SECURITY / PROFILE ── */}
        <section id="security" className="w-full py-28 bg-muted/20 overflow-hidden">
          <div className="container px-4 mx-auto">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              {/* Left: Text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-80px" }}
                variants={staggerContainer}
              >
                <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 text-xs font-bold mb-6">
                  <CheckCircle className="h-3 w-3" />
                  TRUSTED BY 5,000+ PROFESSIONALS
                </motion.div>
                <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-black mb-6 leading-tight">
                  Professional Profiles,{" "}
                  <span className="gradient-text">Privacy First</span>
                </motion.h2>
                <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg mb-10 leading-relaxed">
                  Control your narrative. Share your verified credentials via a professional landing page that you own. Enable or disable any part instantly.
                </motion.p>

                <motion.div variants={fadeUp} custom={3} className="space-y-3 mb-10">
                  {profileChecklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <div className="h-6 w-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary/25 transition-colors">
                        <CheckCircle className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </motion.div>

                <motion.div variants={fadeUp} custom={4}>
                  <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all duration-200">
                    <Link href="/register">
                      Set Up Your Profile <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right: Profile card mock */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 to-violet-500/20 rounded-full blur-[80px]" />
                <div className="relative bg-card border border-primary/20 rounded-3xl p-7 shadow-2xl">
                  {/* Profile header */}
                  <div className="flex items-center gap-4 mb-7">
                    <div className="relative">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/30 to-violet-500/30 animate-pulse-glow" />
                      <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white fill-white" />
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded-lg" />
                      <div className="h-3 w-24 bg-muted/60 animate-pulse rounded-lg" />
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-[10px] font-bold">
                        <ShieldCheck className="h-2.5 w-2.5" /> VERIFIED
                      </div>
                    </div>
                  </div>

                  {/* Bio lines */}
                  <div className="space-y-2 mb-7 pb-7 border-b border-border/50">
                    <div className="h-2.5 w-full bg-muted/50 animate-pulse rounded" />
                    <div className="h-2.5 w-5/6 bg-muted/50 animate-pulse rounded" />
                    <div className="h-2.5 w-3/4 bg-muted/40 animate-pulse rounded" />
                  </div>

                  {/* Documents */}
                  <div className="grid grid-cols-2 gap-4 mb-7">
                    <div className="h-28 rounded-2xl border-2 border-primary/25 flex flex-col items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group">
                      <FileText className="h-7 w-7 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-primary">CV_2026.pdf</span>
                      <span className="text-[9px] text-primary/60 flex items-center gap-0.5">
                        <ShieldCheck className="h-2.5 w-2.5" /> Verified
                      </span>
                    </div>
                    <div className="h-28 rounded-2xl border-2 border-border/60 flex flex-col items-center justify-center gap-2 hover:border-muted-foreground/30 transition-colors cursor-pointer group">
                      <Star className="h-7 w-7 text-muted-foreground group-hover:scale-110 transition-transform" />
                      <span className="text-[11px] font-bold text-muted-foreground">Degree.pdf</span>
                      <span className="text-[9px] text-muted-foreground/60">Pending review</span>
                    </div>
                  </div>

                  {/* Share toggle */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Public Profile</div>
                      <div className="text-[10px] text-muted-foreground/60 mt-0.5">Visible to anyone with link</div>
                    </div>
                    <div className="h-7 w-14 bg-primary rounded-full relative cursor-pointer shadow-inner shadow-primary/40">
                      <div className="absolute right-1 top-1 h-5 w-5 bg-white rounded-full shadow-sm" />
                    </div>
                  </div>
                </div>

                {/* Floating notification */}
                <NotificationBubble className="absolute -top-6 -right-4 sm:-right-6" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CTA BANNER ── */}
        <section className="w-full py-24">
          <div className="container px-4 mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative rounded-3xl overflow-hidden p-12 text-center"
            >
              {/* Gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-violet-600 animate-gradient" />
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255,255,255)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")` }} />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-6">
                  <Sparkles className="h-3.5 w-3.5" />
                  START FOR FREE TODAY
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                  Vault Your Career.<br />Own Your Story.
                </h2>
                <p className="text-white/80 text-lg mb-10 max-w-md mx-auto">
                  Join 5,000+ professionals who trust CVVault with their career credentials.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary" className="rounded-full px-8 h-14 text-base font-semibold hover:scale-105 transition-transform shadow-xl">
                    <Link href="/register">
                      Create Free Account <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="ghost" className="rounded-full px-8 h-14 text-base font-semibold text-white hover:bg-white/10 hover:text-white border border-white/20">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t bg-muted/20 py-14">
        <div className="container px-4 mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <Link className="flex items-center gap-2.5 mb-5" href="/">
                <img src={logoUrl} alt="CVVault Logo" className="h-8 w-8 rounded-lg" />
                <span className="text-lg font-bold gradient-text">CVVault</span>
              </Link>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-6">
                The leading professional vault for career credentials and verified digital identity. Securely store and share your professional life.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3 w-3 text-green-500" />
                <span>SOC 2 Type II compliant · 256-bit encrypted</span>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-5 text-foreground">Platform</h4>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Features", href: "#features" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Security", href: "#security" },
                  { label: "Enterprise", href: "#pricing" },
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-muted-foreground hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm mb-5 text-foreground">Legal</h4>
              <ul className="space-y-3 text-sm">
                {["Privacy Policy", "Terms of Service", "Cookie Policy", "GDPR"].map((l) => (
                  <li key={l}>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2026 CVVault Inc. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-primary text-primary" />
                Made with passion for professionals
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
