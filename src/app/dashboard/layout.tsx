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
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";

import { OnboardingDialog } from "@/components/OnboardingDialog";
import { getProfile } from "@/app/actions/profile";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (user) {
      getProfile(user.uid).then(res => {
        if (res.success && !res.profile.onboarding_completed) {
          setShowOnboarding(true);
        }
      });
    }
  }, [user]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Documents", href: "/dashboard/documents", icon: FileText },
    { label: "Sharing", href: "/dashboard/sharing", icon: Share2 },
    { label: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col fixed inset-y-0">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded" />
            <span>CVVault</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          <Separator className="my-4" />
          <Link 
            href="/dashboard/settings" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium",
              pathname === "/dashboard/settings"
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Link 
            href="/admin" 
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium",
              pathname.startsWith("/admin")
                ? "bg-primary/10 text-primary"
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
            Admin
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={logout}>
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <header className="h-16 border-b bg-background flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-sm font-medium text-muted-foreground">Welcome back, {user.displayName || user.email}</h2>
          <div className="flex items-center gap-4">
             <ModeToggle />
             <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
               {(user.displayName || user.email || "?")[0].toUpperCase()}
             </div>
          </div>
        </header>
          <div className="p-8">
            {children}
          </div>
        </main>
        <OnboardingDialog 
          userId={user.uid} 
          isOpen={showOnboarding} 
          onClose={() => setShowOnboarding(false)} 
        />
      </div>
  );
}
