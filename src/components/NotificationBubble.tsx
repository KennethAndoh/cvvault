"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ShieldCheck, Share2, Sparkles, Bell } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: "view" | "verify" | "share" | "match";
  badge?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Recruiter viewed your CV",
    subtitle: "Senior Tech Recruiter @ Stripe",
    time: "Just now",
    type: "view",
    badge: "LIVE VIEW",
  },
  {
    id: "2",
    title: "Degree Certificate Verified",
    subtitle: "AI Auto-Verification matched 98%",
    time: "3 mins ago",
    type: "verify",
    badge: "VERIFIED",
  },
  {
    id: "3",
    title: "Share Link Accessed",
    subtitle: "Hiring Manager opened cvvault.com/s/7x9",
    time: "12 mins ago",
    type: "share",
    badge: "ACCESSED",
  },
  {
    id: "4",
    title: "Profile Saved to Shortlist",
    subtitle: "Fintech Lead Recruiter bookmarked your profile",
    time: "25 mins ago",
    type: "match",
    badge: "SAVED",
  },
];

const EMPTY_NOTIFICATION: NotificationItem = {
  id: "empty",
  title: "Activity Monitor Active",
  subtitle: "Monitoring profile views & credential checks",
  time: "Live",
  type: "verify",
  badge: "ACTIVE",
};

interface NotificationBubbleProps {
  notifications?: NotificationItem[];
  autoRotate?: boolean;
  intervalMs?: number;
  className?: string;
}

export function NotificationBubble({
  notifications,
  autoRotate = true,
  intervalMs = 4000,
  className = "",
}: NotificationBubbleProps) {
  const activeList = notifications !== undefined
    ? (notifications.length > 0 ? notifications : [EMPTY_NOTIFICATION])
    : DEFAULT_NOTIFICATIONS;

  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIndex(0);
  }, [activeList.length]);

  useEffect(() => {
    if (!autoRotate || isHovered || activeList.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activeList.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoRotate, isHovered, activeList.length, intervalMs]);

  const current = activeList[index] || activeList[0] || DEFAULT_NOTIFICATIONS[0];

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "view":
        return <Eye className="h-4 w-4 text-emerald-500" />;
      case "verify":
        return <ShieldCheck className="h-4 w-4 text-blue-500" />;
      case "share":
        return <Share2 className="h-4 w-4 text-purple-500" />;
      case "match":
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  const getBadgeStyle = (type: NotificationItem["type"]) => {
    switch (type) {
      case "view":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400";
      case "verify":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400";
      case "share":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400";
      case "match":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400";
      default:
        return "bg-primary/10 text-primary border-primary/20";
    }
  };

  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative z-20 group ${className}`}
    >
      {/* Outer glow aura */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />

      {/* Main Glass Bubble */}
      <div className="relative rounded-2xl bg-card/95 dark:bg-card/90 backdrop-blur-xl border border-primary/20 dark:border-white/15 p-3.5 shadow-2xl shadow-primary/10 min-w-[260px] max-w-[320px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
            className="flex items-start gap-3"
          >
            {/* Icon Avatar Container */}
            <div className="relative shrink-0 mt-0.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner">
                {getIcon(current.type)}
              </div>
              {/* Pulse status indicator */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-card" />
              </span>
            </div>

            {/* Notification content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <p className="text-xs font-bold text-foreground truncate tracking-tight">
                  {current.title}
                </p>
                {current.badge && (
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${getBadgeStyle(
                      current.type
                    )} shrink-0`}
                  >
                    {current.badge}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground truncate leading-tight mb-1.5">
                {current.subtitle}
              </p>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-1 border-t border-border/40">
                <span className="flex items-center gap-1 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {current.time}
                </span>
                <span className="text-[9px] text-primary/80 font-semibold group-hover:underline">
                  CVVault Live
                </span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Indicator dots for rotation */}
        {activeList.length > 1 && (
          <div className="flex justify-center gap-1 mt-2.5 pt-1.5 border-t border-border/30">
            {activeList.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === i ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                }`}
                aria-label={`Go to notification ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
