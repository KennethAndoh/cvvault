"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Share2,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  MessageSquare,
  BarChart3,
  Grid,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { OnboardingDialog } from "@/components/OnboardingDialog";
import NotificationInbox from "@/components/NotificationInbox";
import { getUnreadMessageCount } from "@/app/actions/chat";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Messages", href: "/dashboard/chats", icon: MessageSquare },
  { label: "Sharing", href: "/dashboard/sharing", icon: Share2 },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

const mobilePrimaryItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Messages", href: "/dashboard/chats", icon: MessageSquare },
];

const mobileMenuSecondaryItems = [
  { label: "Sharing", href: "/dashboard/sharing", icon: Share2 },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const logoUrl =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const userRole = profile?.role || "employee";
  const avatarUrl = profile?.avatar_url || null;

  // Auto-close mobile FAB menu on navigation
  useEffect(() => {
    setIsFabMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user && profile) {
      const isNewRegistration =
        typeof window !== "undefined" &&
        sessionStorage.getItem("cvvault_new_registration") === "true";

      if (!profile.onboarding_completed && isNewRegistration) {
        setShowOnboarding(true);
      }
    } else if (user && profile === null && !loading) {
      router.push("/register/role");
    }
  }, [user, profile, loading, router]);

  // Fetch unread count and subscribe to real-time new messages
  useEffect(() => {
    if (!user) return;

    if (pathname === "/dashboard/chats") {
      setUnreadCount(0);
      return;
    }

    const fetchUnread = async () => {
      const res = await getUnreadMessageCount(user.uid);
      if (res.success) setUnreadCount(res.count);
    };

    fetchUnread();

    const channel = supabase
      .channel("layout:unread_badge")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => { fetchUnread(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading your vault…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full glass-card">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
        >
          <img
            src={logoUrl}
            alt="Logo"
            className="h-8 w-8 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-200"
          />
          <span className="font-bold text-lg gradient-text">CVVault</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase px-3 mb-3">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const isMessages = item.href === "/dashboard/chats";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group relative",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative shrink-0">
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {isMessages && unreadCount > 0 && !isActive && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </div>
              {item.label}
              {isMessages && unreadCount > 0 && !isActive && (
                <span className="ml-auto h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
              {isActive && (
                <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-70" />
              )}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-border/50">
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground/60 uppercase px-3 mb-3">
            Account
          </p>
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group",
              pathname === "/dashboard/settings"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            Settings
          </Link>
          {userRole === "admin" && (
            <Link
              href="/admin"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium group",
                pathname.startsWith("/admin")
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <ShieldCheck className="h-5 w-5 shrink-0 text-amber-500" />
              Admin Panel
            </Link>
          )}
        </div>
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="h-8 w-8 rounded-full object-cover shrink-0 ring-2 ring-primary/20"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center text-primary font-bold text-sm shrink-0">
              {(user.displayName || user.email || "?")[0].toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate">{user.displayName || "User"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm rounded-xl h-9 transition-colors"
          onClick={() => {
            logout();
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  const currentPageLabel =
    navItems.find(
      (n) =>
        pathname === n.href ||
        (n.href !== "/dashboard" && pathname.startsWith(n.href))
    )?.label ||
    (pathname === "/dashboard/settings" ? "Settings" : "Dashboard");

  return (
    <div className="flex min-h-screen bg-muted/30 overflow-x-hidden max-w-full">
      {/* Sidebar – Desktop */}
      <aside className="w-60 border-r border-border/60 hidden md:flex flex-col fixed inset-y-0 shadow-sm z-20">
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-60 min-w-0 pb-28 md:pb-7 overflow-x-hidden max-w-full">
        {/* Top bar with Safe Area Status Bar padding */}
        <header
          className="sticky top-0 z-30 glass-nav transition-all duration-200"
          style={{ paddingTop: "max(12px, env(safe-area-inset-top, 0px))" }}
        >
          <div className="h-14 px-4 md:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile logo header */}
              <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
                <img src={logoUrl} alt="Logo" className="h-7 w-7 rounded-lg shadow-sm" />
                <span className="font-extrabold text-base gradient-text">CVVault</span>
              </Link>

              {/* Breadcrumb on desktop */}
              <div className="hidden md:flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">CVVault</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
                <span className="font-semibold text-foreground">{currentPageLabel}</span>
              </div>

              {/* Current page title badge on mobile */}
              <span className="md:hidden text-xs font-semibold text-muted-foreground px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                {currentPageLabel}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <ModeToggle />
              <NotificationInbox subscriberId={user.uid} />
              <Link href="/dashboard/profile">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/30 hover:ring-primary transition-all cursor-pointer shadow-sm"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center text-primary font-bold text-sm cursor-pointer hover:scale-105 transition-transform ring-2 ring-primary/30 hover:ring-primary shadow-sm">
                    {(user.displayName || user.email || "?")[0].toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-7 max-w-full overflow-x-hidden">{children}</div>
      </main>

      {/* ── Floating Glass Bottom Navigation Bar (Mobile View) ── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(12px,env(safe-area-inset-bottom,0px))] pointer-events-none">
        <div className="relative max-w-md mx-auto pointer-events-auto">
          {/* FAB Downward / Anchored Glass Menu Popover */}
          <AnimatePresence>
            {isFabMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                  onClick={() => setIsFabMenuOpen(false)}
                />

                {/* Glass FAB Menu card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className="absolute bottom-16 right-0 z-50 w-72 glass-dropdown rounded-3xl p-4 shadow-2xl border border-white/40 dark:border-white/15 overflow-hidden"
                >
                  {/* Menu Header - User Info */}
                  <div className="flex items-center gap-3 pb-3 mb-3 border-b border-border/50">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/30" />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center text-primary font-bold text-sm">
                        {(user.displayName || user.email || "?")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate text-foreground">{user.displayName || "User"}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold tracking-wider text-muted-foreground/70 uppercase px-2 mb-1">
                      More Features
                    </p>
                    {mobileMenuSecondaryItems.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsFabMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                              : "hover:bg-muted/80 text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}

                    {userRole === "admin" && (
                      <Link
                        href="/admin"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setIsFabMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-xs font-semibold hover:bg-muted/80 text-amber-500"
                      >
                        <ShieldCheck className="h-4 w-4 shrink-0" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-3 mt-3 border-t border-border/50">
                    <button
                      onClick={() => {
                        setIsFabMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Bottom Bar Container */}
          <nav className="glass-fab rounded-2xl p-1.5 flex items-center justify-around shadow-2xl border border-white/50 dark:border-white/10">
            {mobilePrimaryItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const isMessages = item.href === "/dashboard/chats";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 relative group min-w-[56px]",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {isMessages && unreadCount > 0 && !isActive && (
                      <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center leading-none shadow-sm">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-semibold mt-1 leading-tight">{item.label}</span>
                </Link>
              );
            })}

            {/* FAB Menu Button */}
            <button
              type="button"
              onClick={() => setIsFabMenuOpen(!isFabMenuOpen)}
              className={cn(
                "flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px] relative",
                isFabMenuOpen
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="relative">
                {isFabMenuOpen ? (
                  <X className="h-5 w-5 animate-in spin-in-90 duration-200" />
                ) : (
                  <Grid className="h-5 w-5" />
                )}
              </div>
              <span className="text-[10px] font-semibold mt-1 leading-tight">Menu</span>
            </button>
          </nav>
        </div>
      </div>

      <OnboardingDialog
        userId={user.uid}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
