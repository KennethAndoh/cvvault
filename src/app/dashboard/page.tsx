"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDocuments } from "@/app/actions/documents";
import { getSharingTokens, getProfile } from "@/app/actions/profile";
import { getRecentAuditLogs } from "@/app/actions/audit";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  ShieldCheck,
  Eye,
  ArrowUpRight,
  Plus,
  Share2,
  Users,
  Search,
  Loader2,
  Briefcase,
  Clock,
  Sparkles,
  ArrowRight,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getJobs, getJobApplications } from "@/app/actions/jobs";
import { motion } from "framer-motion";
import { NotificationBubble, NotificationItem } from "@/components/NotificationBubble";
import { formatDistanceToNow } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDocs: 0,
    verifiedDocs: 0,
    profileViews: 0,
    activeLinks: 0,
    pendingVerifications: 0,
    jobCount: 0,
    appCount: 0,
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData(true);

      // Realtime polling every 8 seconds to fetch fresh audit activity & stats
      const interval = setInterval(() => {
        fetchDashboardData(false);
      }, 8000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchDashboardData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    const profileRes = await getProfile(user!.uid);
    const userRole = profileRes.success ? profileRes.profile?.role : "employee";

    if (profileRes.success) {
      setProfile(profileRes.profile);
    }

    const [docsRes, tokensRes, jobsRes, appsRes, auditRes] = await Promise.all([
      getDocuments(user!.uid),
      getSharingTokens(user!.uid),
      getJobs({ employer_id: user!.uid }),
      getJobApplications(
        userRole === "employer"
          ? { employer_id: user!.uid }
          : { employee_id: user!.uid }
      ),
      getRecentAuditLogs(user!.uid, 10),
    ]);

    if (docsRes.success) {
      const docs = docsRes.documents || [];
      setRecentDocs(docs.slice(0, 4));
      const verified = docs.filter(
        (d: any) => d.metadata?.verification_status === "verified"
      ).length;
      const pending = docs.filter(
        (d: any) =>
          !d.metadata?.verification_status ||
          d.metadata.verification_status === "pending"
      ).length;
      setStats((prev) => ({
        ...prev,
        totalDocs: docs.length,
        verifiedDocs:
          docs.length > 0 ? Math.round((verified / docs.length) * 100) : 0,
        pendingVerifications: pending,
      }));
    }

    if (tokensRes.success) {
      setStats((prev) => ({
        ...prev,
        activeLinks: (tokensRes.tokens || []).length,
      }));
    }

    if (jobsRes.success) {
      setStats((prev) => ({
        ...prev,
        jobCount: (jobsRes.jobs || []).length,
      }));
    }

    if (appsRes.success) {
      setStats((prev) => ({
        ...prev,
        appCount: (appsRes.applications || []).length,
      }));
    }

    // Transform audit logs into NotificationItem[]
    if (auditRes.success && auditRes.logs.length > 0) {
      const mapped: NotificationItem[] = auditRes.logs
        .map((log: any): NotificationItem | null => {
          const logDate = log.created_at ? new Date(log.created_at) : new Date();
          const timeAgo = isNaN(logDate.getTime()) ? "Recently" : formatDistanceToNow(logDate, { addSuffix: true });
          switch (log.action) {
            case "DOCUMENT_UPLOAD":
              return {
                id: log.id,
                type: "verify",
                title: "Document Uploaded",
                subtitle: log.details?.name
                  ? `"${log.details.name}" added to your vault`
                  : "A new document was added to your vault",
                time: timeAgo,
                badge: "UPLOADED",
              };
            case "TOKEN_VIEW":
              return {
                id: log.id,
                type: "view",
                title: "Share Link Opened",
                subtitle: log.details?.docId === "full_profile"
                  ? "Someone viewed your shared profile"
                  : "Someone opened your shared document",
                time: timeAgo,
                badge: "LIVE VIEW",
              };
            case "TOKEN_DOCUMENT_DOWNLOAD":
              return {
                id: log.id,
                type: "share",
                title: "Document Downloaded",
                subtitle: "A recipient downloaded a shared document",
                time: timeAgo,
                badge: "ACCESSED",
              };
            case "SHARING_TOKEN_CREATE":
              return {
                id: log.id,
                type: "share",
                title: "Share Link Created",
                subtitle: log.details?.docId === "full_profile"
                  ? "New link for your full profile"
                  : "New link for a specific document",
                time: timeAgo,
                badge: "SHARED",
              };
            case "SHARING_TOKEN_DELETE":
              return {
                id: log.id,
                type: "share",
                title: "Share Link Revoked",
                subtitle: "A sharing link was deleted",
                time: timeAgo,
                badge: "REVOKED",
              };
            case "DOCUMENT_DELETE":
              return {
                id: log.id,
                type: "verify",
                title: "Document Removed",
                subtitle: "A document was deleted from your vault",
                time: timeAgo,
                badge: "DELETED",
              };
            case "PROFILE_UPDATE":
              return {
                id: log.id,
                type: "match",
                title: "Profile Updated",
                subtitle: log.details?.fields?.length
                  ? `Fields updated: ${log.details.fields.slice(0, 2).join(", ")}`
                  : "Your profile information was updated",
                time: timeAgo,
                badge: "UPDATED",
              };
            case "AVATAR_UPLOAD":
              return {
                id: log.id,
                type: "match",
                title: "Profile Photo Updated",
                subtitle: "Your avatar was successfully changed",
                time: timeAgo,
                badge: "UPDATED",
              };
            case "job_applied":
              return {
                id: log.id,
                type: "match",
                title: "Job Application Sent",
                subtitle: "Application submitted to hiring team",
                time: timeAgo,
                badge: "APPLIED",
              };
            case "job_created":
              return {
                id: log.id,
                type: "share",
                title: "Job Listing Posted",
                subtitle: log.details?.title ? `"${log.details.title}" is now active` : "New job posted",
                time: timeAgo,
                badge: "POSTED",
              };
            case "application_status_updated":
              const isAccepted = log.details?.status === "accepted";
              const isRejected = log.details?.status === "rejected";
              return {
                id: log.id,
                type: isAccepted ? "verify" : isRejected ? "share" : "match",
                title: isAccepted
                  ? "Job Offer Accepted!"
                  : isRejected
                  ? "Application Declined"
                  : "Application Status Changed",
                subtitle: log.details?.jobTitle
                  ? `Your application for "${log.details.jobTitle}" was ${log.details.status}.`
                  : `Status updated to ${log.details?.status || "processed"}`,
                time: timeAgo,
                badge: (log.details?.status || "UPDATED").toUpperCase(),
              };
            case "application_retracted":
              return {
                id: log.id,
                type: "share",
                title: "Application Retracted",
                subtitle: "Job application was withdrawn",
                time: timeAgo,
                badge: "WITHDRAWN",
              };
            default:
              return null;
          }
        })
        .filter((n): n is NotificationItem => n !== null)
        .slice(0, 5);

      setNotifications(mapped);
    }

    setLoading(false);
  };

  if (loading)
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading your dashboard…</p>
        </div>
      </div>
    );

  const isEmployer = profile?.role === "employer";

  const statCards = isEmployer
    ? [
        {
          title: "Active Job Posts",
          value: stats.jobCount,
          suffix: "",
          icon: Briefcase,
          desc: "Open positions",
          color: "from-blue-500/15 to-indigo-500/10",
          iconBg: "bg-blue-500/15 text-blue-600",
          trend: "+2 this week",
        },
        {
          title: "Total Applicants",
          value: stats.appCount,
          suffix: "",
          icon: Users,
          desc: "Across all job posts",
          color: "from-violet-500/15 to-purple-500/10",
          iconBg: "bg-violet-500/15 text-violet-600",
          trend: "Growing",
        },
        {
          title: "Candidates Saved",
          value: stats.profileViews,
          suffix: "",
          icon: Eye,
          desc: "Across talent pool",
          color: "from-cyan-500/15 to-teal-500/10",
          iconBg: "bg-cyan-500/15 text-cyan-600",
          trend: "All time",
        },
        {
          title: "Active Share Links",
          value: stats.activeLinks,
          suffix: "",
          icon: UploadCloud,
          desc: "Shared access points",
          color: "from-orange-500/15 to-amber-500/10",
          iconBg: "bg-orange-500/15 text-orange-600",
          trend: "Live now",
        },
      ]
    : [
        {
          title: "Total Documents",
          value: stats.totalDocs,
          suffix: "",
          icon: FileText,
          desc: "Across all categories",
          color: "from-blue-500/15 to-indigo-500/10",
          iconBg: "bg-blue-500/15 text-blue-600",
          trend: stats.pendingVerifications > 0 ? `${stats.pendingVerifications} pending` : "All good",
        },
        {
          title: "Job Applications",
          value: stats.appCount,
          suffix: "",
          icon: Briefcase,
          desc: "Active submissions",
          color: "from-violet-500/15 to-purple-500/10",
          iconBg: "bg-violet-500/15 text-violet-600",
          trend: "In progress",
        },
        {
          title: "Profile Views",
          value: stats.profileViews,
          suffix: "",
          icon: Eye,
          desc: "Total external visits",
          color: "from-cyan-500/15 to-teal-500/10",
          iconBg: "bg-cyan-500/15 text-cyan-600",
          trend: "All time",
        },
        {
          title: "Verified Docs",
          value: stats.verifiedDocs,
          suffix: "%",
          icon: ShieldCheck,
          desc: "Verification rate",
          color: "from-green-500/15 to-emerald-500/10",
          iconBg: "bg-green-500/15 text-green-600",
          trend: "Completion",
        },
      ];

  return (
    <motion.div
      className="space-y-7"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
    >
      {/* Page header */}
      <motion.div
        variants={fadeUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            {isEmployer ? "Employer Workspace" : "Dashboard"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isEmployer
              ? "Verify credentials and manage talent sharing links."
              : `Welcome back${user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}! Here's what's happening.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBubble
            notifications={notifications}
            autoRotate
            intervalMs={5000}
            className="hidden lg:block scale-90"
          />
          {isEmployer ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full font-semibold text-xs border border-primary/20">
              <Users className="h-3.5 w-3.5" />
              Verified Employer Account
            </div>
          ) : (
            <Button asChild size="sm" className="rounded-full shadow-sm shadow-primary/20">
              <Link href="/dashboard/documents">
                <Plus className="h-4 w-4 mr-1.5" />
                Upload Document
              </Link>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div key={i} variants={fadeUp} custom={i}>
            <Card
              className={`relative overflow-hidden border border-border/60 bg-gradient-to-br ${card.color} hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 transition-all duration-300 group`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-5 px-5">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-xl ${card.iconBg} group-hover:scale-110 transition-transform duration-200`}>
                  <card.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="pb-5 px-5">
                <div className="text-3xl font-black text-foreground mb-1">
                  {card.value}
                  {card.suffix && <span className="text-xl">{card.suffix}</span>}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{card.desc}</p>
                  <span className="text-[10px] font-medium text-muted-foreground/70">{card.trend}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid gap-5 lg:grid-cols-7">
        {/* Recent docs */}
        <motion.div variants={fadeUp} custom={4} className="lg:col-span-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">
                  {isEmployer ? "Recent Talent Activity" : "Recent Documents"}
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-xs text-primary h-7 px-2 rounded-lg" asChild>
                  <Link href="/dashboard/documents">
                    View all <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-2">
                {recentDocs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold mb-1">No documents yet</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {isEmployer
                        ? "No candidate documents found."
                        : "Upload your first document to get started."}
                    </p>
                    {!isEmployer && (
                      <Button size="sm" className="rounded-full" asChild>
                        <Link href="/dashboard/documents">
                          <Plus className="h-4 w-4 mr-1" /> Upload Now
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  recentDocs.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-primary/20 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/15 transition-colors">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-sm truncate max-w-[180px]">
                            {doc.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {doc.category} ·{" "}
                            {new Date(doc.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.metadata?.verification_status === "verified" && (
                          <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full hidden sm:block">
                            Verified
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          asChild
                        >
                          <Link href="/dashboard/documents">
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} custom={5} className="lg:col-span-3 space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3 px-5 pt-5">
              <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-2">
              {isEmployer ? (
                <>
                  <Button
                    className="w-full justify-start gap-3 rounded-xl h-11 font-semibold"
                    asChild
                  >
                    <Link href="/dashboard/jobs">
                      <Plus className="h-4 w-4" />
                      Post New Job
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-xl h-11 font-semibold border-border/60 hover:border-primary/30 hover:bg-primary/5"
                    asChild
                  >
                    <Link href="/dashboard/jobs">
                      <Briefcase className="h-4 w-4" />
                      Manage Job Listings
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full justify-start gap-3 rounded-xl h-11 font-semibold"
                    asChild
                  >
                    <Link href="/dashboard/jobs">
                      <Search className="h-4 w-4" />
                      Browse All Jobs
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-xl h-11 font-semibold border-border/60 hover:border-primary/30 hover:bg-primary/5"
                    asChild
                  >
                    <Link href="/dashboard/jobs">
                      <Clock className="h-4 w-4" />
                      Track Applications
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 rounded-xl h-11 font-semibold border-border/60 hover:border-primary/30 hover:bg-primary/5"
                    asChild
                  >
                    <Link href="/dashboard/sharing">
                      <Share2 className="h-4 w-4" />
                      Manage Sharing Links
                    </Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pro tip card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/8 to-violet-500/5 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-8 translate-x-8" />
            <CardContent className="p-5 relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wide">
                  {isEmployer ? "Employer Tip" : "Pro Tip"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {isEmployer
                  ? "Verified documents carry a CVVault seal of trust, speeding up your vetting process."
                  : "Share your entire verified profile with recruiters using a secure, time-limited link."}
              </p>
              <Button
                size="sm"
                className="w-full rounded-xl font-semibold"
                variant="secondary"
                asChild
              >
                <Link href="/dashboard/sharing">
                  {isEmployer ? "Manage Recruitment" : "Manage Access"}
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Verification progress (employee only) */}
          {!isEmployer && (
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Verification Progress
                  </span>
                  <span className="text-sm font-black text-foreground">{stats.verifiedDocs}%</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-violet-500 rounded-full transition-all duration-700"
                    style={{ width: `${stats.verifiedDocs}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">
                    {stats.pendingVerifications} pending
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {stats.totalDocs} total docs
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
