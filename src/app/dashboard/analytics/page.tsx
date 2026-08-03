"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getVaultAnalytics, VaultAnalyticsData } from "@/app/actions/analytics";
import { GeoActivityMap } from "@/components/GeoActivityMap";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Eye,
  Share2,
  ShieldCheck,
  FileText,
  TrendingUp,
  Globe,
  Monitor,
  Loader2,
  Download,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<VaultAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAnalytics = async (showSpinner = true) => {
    if (!user) return;
    if (showSpinner) setLoading(true);
    else setIsRefreshing(true);

    const res = await getVaultAnalytics(user.uid);
    if (res.success && res.analytics) {
      setData(res.analytics);
    }
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!user) return;

    loadAnalytics(true);

    // Auto-refresh metrics every 30 seconds
    const interval = setInterval(() => {
      loadAnalytics(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  const exportActivityLogCsv = () => {
    if (!data?.recentViewers || data.recentViewers.length === 0) return;

    const headers = ["Event Action", "Estimated Location", "Device / Client", "Timestamp"];
    const rows = data.recentViewers.map((log) => [
      `"${(log.action || "").replace(/"/g, '""')}"`,
      `"${(log.location || "").replace(/"/g, '""')}"`,
      `"${(log.device || "").replace(/"/g, '""')}"`,
      `"${new Date(log.timestamp).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `vault_activity_log_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const maxMonthlyViews = data
    ? Math.max(...data.monthlyActivity.map((m) => m.views), 1)
    : 1;

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-8 pb-12">
      {/* Header */}
      <motion.div variants={fadeUp} custom={0} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" /> Vault Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time engagement metrics, access logs, and link performance for your credential vault.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Auto-Refresh (30s)
          </span>
          <Button onClick={() => loadAnalytics(false)} variant="outline" size="sm" className="gap-2" disabled={isRefreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} /> Refresh Metrics
          </Button>
        </div>
      </motion.div>

      {/* Summary KPI Cards */}
      <motion.div variants={fadeUp} custom={1} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Profile Views</p>
              <h3 className="text-2xl font-black mt-1">{data?.totalProfileViews || 0}</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> +24% this month
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Eye className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Reads</p>
              <h3 className="text-2xl font-black mt-1">{data?.totalDocumentViews || 0}</h3>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-bold flex items-center gap-1 mt-1">
                <FileText className="h-3 w-3" /> Vault credentials
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-600">
              <FileText className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Shared Link Clicks</p>
              <h3 className="text-2xl font-black mt-1">{data?.totalSharedLinkClicks || 0}</h3>
              <p className="text-[11px] text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1 mt-1">
                <Share2 className="h-3 w-3" /> Token conversions
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-600">
              <Share2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verified Intact Rate</p>
              <h3 className="text-2xl font-black mt-1">{data?.verifiedDocsCount || 0} Docs</h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-1">
                <ShieldCheck className="h-3 w-3" /> Ledger Authenticated
              </p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Engagement Chart & Heatmap Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Activity Bar Visualizer */}
        <motion.div variants={fadeUp} custom={2} className="lg:col-span-2">
          <Card className="border border-border/60 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" /> Engagement Growth & Monthly Views
              </CardTitle>
              <CardDescription>Visualizing profile impressions and link access trends over the past 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 pb-6">
              <div className="h-60 flex items-end justify-between gap-4 px-2 pt-6">
                {data?.monthlyActivity.map((item, i) => {
                  const barHeight = Math.round((item.views / maxMonthlyViews) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[11px] font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.views}
                      </div>
                      <div className="w-full bg-muted rounded-t-lg relative overflow-hidden flex items-end h-44">
                        <div
                          className="w-full bg-linear-to-t from-primary/80 to-sky-400 rounded-t-lg transition-all duration-700 group-hover:brightness-110"
                          style={{ height: `${Math.max(barHeight, 15)}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Performing Document Showcase */}
        <motion.div variants={fadeUp} custom={3}>
          <Card className="border border-border/60 shadow-sm h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                Top Viewed Document
              </CardTitle>
              <CardDescription>Your most engaged credential proof.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data?.topDocument ? (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary text-primary-foreground rounded-xl">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm truncate">{data.topDocument.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground font-semibold uppercase">
                        {data.topDocument.category}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-primary/10 flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Total Accesses:</span>
                    <span className="text-primary font-bold">{data.topDocument.views} Views</span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  Upload documents to track view engagement.
                </div>
              )}

              {/* Quick Heatmap Status */}
              <div className="p-4 bg-muted/40 rounded-2xl space-y-2 border">
                <span className="text-xs font-bold text-foreground block">Vault Activity Status</span>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your credentials have an active <span className="text-emerald-600 font-bold">98% trust index</span> with verified tamper-proof proof seals.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Interactive Geo Map */}
      <motion.div variants={fadeUp} custom={4}>
        <GeoActivityMap viewers={data?.recentViewers || []} />
      </motion.div>

      {/* Live Access Log Table */}
      <motion.div variants={fadeUp} custom={5}>
        <Card className="border border-border/60 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" /> Live Viewer Activity Log
              </CardTitle>
              <CardDescription>Geographic location and device breakdown of recruiters and link viewers.</CardDescription>
            </div>
            <Button
              onClick={exportActivityLogCsv}
              variant="outline"
              size="sm"
              className="gap-2 shrink-0 text-xs font-semibold"
              disabled={!data?.recentViewers || data.recentViewers.length === 0}
            >
              <Download className="h-4 w-4" /> Download CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto overflow-y-auto max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase font-bold text-[10px] border-b sticky top-0 backdrop-blur-xs">
                  <tr>
                    <th className="p-3">Event Action</th>
                    <th className="p-3">Estimated Location</th>
                    <th className="p-3">Device / Client</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(data?.recentViewers || []).map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold text-foreground flex items-center gap-2">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        {log.action}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                          <Globe className="h-3 w-3 text-sky-500" /> {log.location}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Monitor className="h-3 w-3 text-violet-500" /> {log.device}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground font-mono">
                        {new Date(log.timestamp).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
