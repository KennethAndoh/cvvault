"use client";

import React from "react";
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
  Menu,
  Briefcase,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { OnboardingDialog } from "@/components/OnboardingDialog";
import NotificationInbox from "@/components/NotificationInbox";
import { getProfile } from "@/app/actions/profile";
import { getUnreadMessageCount } from "@/app/actions/chat";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Documents", href: "/dashboard/documents", icon: FileText },
  { label: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { label: "Messages", href: "/dashboard/chats", icon: MessageSquare },
  { label: "Sharing", href: "/dashboard/sharing", icon: Share2 },
  { label: "Profile", href: "/dashboard/profile", icon: User },
];

const logoUrl =
  "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const isNewRegistration =
        typeof window !== "undefined" &&
        sessionStorage.getItem("cvvault_new_registration") === "true";

      getProfile(user.uid).then((res) => {
        if (res.success) {
          if (res.profile) {
            setUserRole(res.profile.role);
            setAvatarUrl(res.profile.avatar_url || null);
            if (!res.profile.onboarding_completed && isNewRegistration) {
              setShowOnboarding(true);
            }
          } else {
            router.push("/register/role");
          }
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && pathname !== "/dashboard/profile") {
      getProfile(user.uid).then((res) => {
        if (res.success && res.profile) {
          setAvatarUrl(res.profile.avatar_url || null);
        }
      });
    }
  }, [pathname]);

  // Fetch unread count and subscribe to real-time new messages
  useEffect(() => {
    if (!user) return;

    // Clear badge immediately when user is on the chats page
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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group"
          onClick={() => setIsMobileMenuOpen(false)}
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
              onClick={() => setIsMobileMenuOpen(false)}
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
              {isActive && !isMessages && (
                <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-70" />
              )}
              {isActive && isMessages && (
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
            onClick={() => setIsMobileMenuOpen(false)}
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
              onClick={() => setIsMobileMenuOpen(false)}
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
            setIsMobileMenuOpen(false);
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
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar – Desktop */}
      <aside className="w-60 border-r border-border/60 bg-background hidden md:flex flex-col fixed inset-y-0 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Main */}
      <main className="flex-1 md:ml-60 min-w-0">
        {/* Top bar */}
        <header className="h-14 border-b border-border/60 bg-background/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile nav trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8 rounded-lg"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-60">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-muted-foreground hidden sm:block">CVVault</span>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 hidden sm:block" />
              <span className="font-semibold text-foreground">{currentPageLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModeToggle />
            <NotificationInbox subscriberId={user.uid} />
            <Link href="/dashboard/profile">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20 hover:ring-primary/50 transition-all cursor-pointer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-violet-500/30 flex items-center justify-center text-primary font-bold text-sm cursor-pointer hover:scale-105 transition-transform ring-2 ring-primary/20 hover:ring-primary/50">
                  {(user.displayName || user.email || "?")[0].toUpperCase()}
                </div>
              )}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 md:p-7">{children}</div>
      </main>

      <OnboardingDialog
        userId={user.uid}
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
}
