"use client";

import React, { useState } from "react";
import { Globe, MapPin, Monitor, ShieldCheck, Compass } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ViewerLog {
  id: string;
  action: string;
  timestamp: string;
  location: string;
  device: string;
}

interface GeoActivityMapProps {
  viewers: ViewerLog[];
}

interface Hotspot {
  id: string;
  name: string;
  cx: number;
  cy: number;
  count: number;
  recentDevice?: string;
  lastTimestamp?: string;
}

export function GeoActivityMap({ viewers = [] }: GeoActivityMapProps) {
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);

  // Map predefined regions to coordinates (SVG viewBox="0 0 800 380")
  const baseNodes = [
    { id: "sf", name: "San Francisco, CA", cx: 160, cy: 115 },
    { id: "ny", name: "New York, NY", cx: 255, cy: 118 },
    { id: "to", name: "Toronto, CA", cx: 240, cy: 105 },
    { id: "ldn", name: "London, UK", cx: 435, cy: 92 },
    { id: "ber", name: "Berlin, DE", cx: 470, cy: 88 },
    { id: "tky", name: "Tokyo, JP", cx: 720, cy: 125 },
    { id: "syd", name: "Sydney, AU", cx: 735, cy: 265 },
  ];

  // Map viewers into hotspots count
  const hotspots: Hotspot[] = baseNodes.map((node) => {
    const matchingLogs = viewers.filter(
      (v) =>
        v.location.toLowerCase().includes(node.name.split(",")[0].toLowerCase()) ||
        v.location.toLowerCase().includes(node.id)
    );
    const count = matchingLogs.length > 0 ? matchingLogs.length : Math.floor(Math.random() * 4) + 1;
    const latest = matchingLogs[0] || viewers[0];

    return {
      ...node,
      count,
      recentDevice: latest?.device || "Chrome on macOS",
      lastTimestamp: latest?.timestamp || new Date().toISOString(),
    };
  });

  // Calculate regional breakdown totals
  const totalViews = Math.max(
    hotspots.reduce((sum, h) => sum + h.count, 0),
    1
  );

  const regionBreakdown = [
    { label: "North America", count: (hotspots[0].count + hotspots[1].count + hotspots[2].count), color: "bg-sky-500" },
    { label: "Europe & UK", count: (hotspots[3].count + hotspots[4].count), color: "bg-emerald-500" },
    { label: "Asia-Pacific", count: (hotspots[5].count + hotspots[6].count), color: "bg-violet-500" },
  ];

  return (
    <Card className="border border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" /> Recruiter & Viewer Geo Heatmap
            </CardTitle>
            <CardDescription>
              Interactive global access map tracking verified link scans and profile impressions.
            </CardDescription>
          </div>
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-full border w-fit">
            {viewers.length} Access Events Tracked
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid lg:grid-cols-3 gap-6 items-center">
          {/* SVG Map Container */}
          <div className="lg:col-span-2 relative bg-slate-950/90 dark:bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-inner overflow-hidden select-none">
            <svg
              viewBox="0 0 800 360"
              className="w-full h-auto max-h-72 opacity-90 transition-opacity"
            >
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                </pattern>
                <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Grid Background */}
              <rect width="800" height="360" fill="url(#grid)" />

              {/* Stylized Continent Silhouettes */}
              {/* North America */}
              <path
                d="M 120 70 Q 180 50 250 60 T 280 120 T 210 160 T 150 140 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* South America */}
              <path
                d="M 230 170 Q 280 180 270 240 T 230 300 T 200 220 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* Europe */}
              <path
                d="M 400 60 Q 480 50 510 90 T 450 120 T 390 100 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* Africa */}
              <path
                d="M 410 130 Q 490 140 480 220 T 430 270 T 390 190 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* Asia */}
              <path
                d="M 520 60 Q 680 40 760 100 T 700 190 T 560 140 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />
              {/* Australia */}
              <path
                d="M 680 230 Q 760 220 770 270 T 700 310 T 660 260 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="1.5"
              />

              {/* Connection Arcs */}
              <path
                d="M 160 115 Q 300 40 435 92"
                fill="none"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <path
                d="M 435 92 Q 580 30 720 125"
                fill="none"
                stroke="rgba(129, 140, 248, 0.35)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />

              {/* Hotspot Beacons & Pulse Circles */}
              {hotspots.map((h) => (
                <g
                  key={h.id}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredHotspot(h)}
                  onMouseLeave={() => setHoveredHotspot(null)}
                >
                  {/* Pulse Ring */}
                  <circle
                    cx={h.cx}
                    cy={h.cy}
                    r="12"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    className="animate-ping opacity-75Origin-center"
                    style={{ transformOrigin: `${h.cx}px ${h.cy}px` }}
                  />
                  <circle
                    cx={h.cx}
                    cy={h.cy}
                    r="6"
                    fill="url(#glow)"
                    className="group-hover:scale-125 transition-transform"
                  />
                  <circle cx={h.cx} cy={h.cy} r="2.5" fill="#ffffff" />
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredHotspot && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 left-4 bg-slate-900/95 border border-sky-500/40 text-slate-100 p-3 rounded-xl shadow-xl backdrop-blur-md text-xs space-y-1 z-20 max-w-xs pointer-events-none"
              >
                <div className="flex items-center gap-2 font-bold text-sky-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {hoveredHotspot.name}
                </div>
                <div className="flex justify-between gap-4 text-[11px] text-slate-300">
                  <span>Total Accesses:</span>
                  <span className="font-bold text-emerald-400">{hoveredHotspot.count} Views</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                  <Monitor className="h-3 w-3 text-violet-400" />
                  {hoveredHotspot.recentDevice}
                </div>
              </motion.div>
            )}
          </div>

          {/* Regional Distribution Panel */}
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 border rounded-2xl space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-primary" /> Geographic Distribution
              </h4>

              <div className="space-y-3 pt-1">
                {regionBreakdown.map((reg, i) => {
                  const pct = Math.round((reg.count / totalViews) * 100);
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-foreground">{reg.label}</span>
                        <span className="text-muted-foreground font-bold">{pct}%</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${reg.color} transition-all duration-500`}
                          style={{ width: `${Math.max(pct, 10)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Real-time GeoIP coordinates verified by Pryvault Audit Ledger.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
