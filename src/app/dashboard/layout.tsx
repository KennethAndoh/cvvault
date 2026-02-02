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
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { OnboardingDialog } from "@/components/OnboardingDialog";
import { getProfile } from "@/app/actions/profile";
import { syncUserProfile } from "@/app/actions/auth";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const isNewRegistration = typeof window !== "undefined" && sessionStorage.getItem("cvvault_new_registration") === "true";

      getProfile(user.uid).then(res => {
        if (res.success) {
          if (!res.profile) {
            // Profile missing, sync it
            syncUserProfile(
              user.uid, 
              user.email || "", 
              user.displayName || "Anonymous User", 
              "employee" // Default to employee
            ).then(syncRes => {
              if (syncRes.success && isNewRegistration) {
                setShowOnboarding(true);
              }
            });
          } else if (!res.profile.onboarding_completed && isNewRegistration) {
            setShowOnboarding(true);
          }
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

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl" onClick={() => setIsMobileMenuOpen(false)}>
          <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded" />
          <span>CVVault</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary shadow-sm" 
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
          onClick={() => setIsMobileMenuOpen(false)}
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
          onClick={() => setIsMobileMenuOpen(false)}
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
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r bg-background hidden md:flex flex-col fixed inset-y-0">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64">
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {/* Mobile Nav Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                </SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>
            
            <h2 className="text-sm font-medium text-muted-foreground line-clamp-1">
              <span className="hidden sm:inline">Welcome back, </span>
              {user.displayName || user.email}
            </h2>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
             <ModeToggle />
             <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
               {(user.displayName || user.email || "?")[0].toUpperCase()}
             </div>
          </div>
        </header>
        <div className="p-4 md:p-8">
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
