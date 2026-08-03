"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export interface VaultAnalyticsData {
  totalProfileViews: number;
  totalDocumentViews: number;
  totalSharedLinkClicks: number;
  verifiedDocsCount: number;
  topDocument: { name: string; category: string; views: number } | null;
  recentViewers: {
    id: string;
    action: string;
    timestamp: string;
    details?: any;
    location: string;
    device: string;
  }[];
  monthlyActivity: { month: string; views: number; shares: number }[];
}

export async function getVaultAnalytics(userId: string): Promise<{
  success: boolean;
  analytics?: VaultAnalyticsData;
  error?: string;
}> {
  try {
    // 1. Fetch ALL audit logs for this user (up to 500 for accurate aggregation)
    const { data: auditLogs } = await supabaseAdmin
      .from("audit_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(500);

    const logs = auditLogs || [];

    // 2. Fetch User Documents
    const { data: documents } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("user_id", userId);

    // 3. Fetch User Sharing Tokens with real view counts
    const { data: sharingTokens } = await supabaseAdmin
      .from("sharing_tokens")
      .select("*")
      .eq("user_id", userId);

    // ── Real metric derivation from audit logs ──────────────────────────────

    // Count TOKEN_VIEW events as profile / shared-link views
    const tokenViewLogs = logs.filter((l) => l.action === "TOKEN_VIEW");
    const totalSharedLinkClicks =
      (sharingTokens || []).reduce((sum, t) => sum + (t.view_count || 0), 0) ||
      tokenViewLogs.length;

    // Count document-related events
    const docViewLogs = logs.filter((l) =>
      ["TOKEN_DOCUMENT_DOWNLOAD", "DOCUMENT_VIEW"].includes(l.action)
    );
    // Sum view_count from document metadata when available, else count log events
    const metadataViewTotal = (documents || []).reduce(
      (sum, d) => sum + (d.metadata?.view_count || 0),
      0
    );
    const totalDocumentViews =
      metadataViewTotal > 0 ? metadataViewTotal : docViewLogs.length;

    // Profile views = token views + document downloads (anyone who opened a shared link)
    const totalProfileViews = Math.max(
      tokenViewLogs.length + totalDocumentViews,
      totalSharedLinkClicks
    );

    // Verified docs
    const verifiedDocsCount = (documents || []).filter(
      (d) => d.metadata?.verification_status === "verified"
    ).length;

    // Top viewed document — by view_count metadata, else most recently uploaded
    let topDoc: VaultAnalyticsData["topDocument"] = null;
    if (documents && documents.length > 0) {
      const sortedDocs = [...documents].sort(
        (a, b) => (b.metadata?.view_count || 0) - (a.metadata?.view_count || 0)
      );
      topDoc = {
        name: sortedDocs[0].name,
        category: sortedDocs[0].category,
        views: sortedDocs[0].metadata?.view_count || 0,
      };
    }

    // ── Monthly Activity from real audit log timestamps ─────────────────────
    const now = new Date();
    const monthlyActivity: { month: string; views: number; shares: number }[] =
      [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleString("en-US", { month: "short" });
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-indexed

      const viewsInMonth = logs.filter((l) => {
        const logDate = new Date(l.created_at);
        return (
          logDate.getFullYear() === year &&
          logDate.getMonth() === month &&
          ["TOKEN_VIEW", "TOKEN_DOCUMENT_DOWNLOAD", "DOCUMENT_VIEW"].includes(
            l.action
          )
        );
      }).length;

      const sharesInMonth = logs.filter((l) => {
        const logDate = new Date(l.created_at);
        return (
          logDate.getFullYear() === year &&
          logDate.getMonth() === month &&
          l.action === "SHARING_TOKEN_CREATE"
        );
      }).length;

      monthlyActivity.push({
        month: monthLabel,
        views: viewsInMonth,
        shares: sharesInMonth,
      });
    }

    // ── User-Agent & GeoIP parsing ──────────────────────────────────────────
    const parseDevice = (ua?: string): string => {
      if (!ua) return "Unknown Device";
      let browser = "Browser";
      if (ua.includes("Firefox/")) browser = "Firefox";
      else if (ua.includes("Edg/")) browser = "Edge";
      else if (ua.includes("Chrome/")) browser = "Chrome";
      else if (ua.includes("Safari/") && !ua.includes("Chrome"))
        browser = "Safari";
      else if (ua.includes("OPR/") || ua.includes("Opera/")) browser = "Opera";

      let os = "Device";
      if (ua.includes("Windows")) os = "Windows";
      else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
      else if (ua.includes("Mac OS X")) os = "macOS";
      else if (ua.includes("Android")) os = "Android";
      else if (ua.includes("Linux")) os = "Linux";

      return `${browser} on ${os}`;
    };

    const resolveLocation = async (
      ip?: string,
      fallback?: string
    ): Promise<string> => {
      if (fallback && fallback !== "Unknown Location") return fallback;
      if (
        !ip ||
        ip === "127.0.0.1" ||
        ip === "::1" ||
        ip.startsWith("192.168.") ||
        ip.startsWith("10.")
      ) {
        return "Local / Dev";
      }
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 2000);
        const res = await fetch(
          `http://ip-api.com/json/${ip}?fields=status,city,regionName,country`,
          { signal: ctrl.signal }
        );
        clearTimeout(tid);
        if (res.ok) {
          const geo = await res.json();
          if (geo.status === "success") {
            return [geo.city, geo.regionName || geo.country]
              .filter(Boolean)
              .join(", ");
          }
        }
      } catch {
        // timeout or network error — fall through
      }
      return "Unknown Location";
    };

    // Only surface viewer-relevant events in the activity log
    const viewerActions = new Set([
      "TOKEN_VIEW",
      "TOKEN_DOCUMENT_DOWNLOAD",
      "DOCUMENT_VIEW",
      "SHARING_TOKEN_CREATE",
      "DOCUMENT_UPLOAD",
      "DOCUMENT_DELETE",
      "DOCUMENT_AUTO_VERIFY",
      "RECRUITER_DOCUMENT_VERIFIED",
      "PROFILE_UPDATE",
    ]);

    const relevantLogs = logs
      .filter((l) => viewerActions.has(l.action))
      .slice(0, 20);

    const recentViewers = await Promise.all(
      relevantLogs.map(async (log) => {
        const details = log.details || {};
        const ip = details.ip;
        const ua = details.userAgent;
        const location = await resolveLocation(ip, details.location);
        const device = parseDevice(ua) || details.device || "Unknown Device";

        return {
          id: log.id,
          action: log.action,
          timestamp: log.created_at,
          details: log.details,
          location,
          device,
        };
      })
    );

    return {
      success: true,
      analytics: {
        totalProfileViews,
        totalDocumentViews,
        totalSharedLinkClicks,
        verifiedDocsCount,
        topDocument: topDoc,
        recentViewers,
        monthlyActivity,
      },
    };
  } catch (error: any) {
    console.error("Error fetching vault analytics:", error);
    return { success: false, error: error.message || "Failed to load analytics" };
  }
}
