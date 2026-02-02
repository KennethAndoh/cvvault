"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
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

import { OnboardingDialog } from "@/components/OnboardingDialog";
import { getProfile } from "@/app/actions/profile";
import { useEffect, useState } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
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
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/dashboard/documents" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <FileText className="h-5 w-5" />
            Documents
          </Link>
          <Link href="/dashboard/sharing" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <Share2 className="h-5 w-5" />
            Sharing
          </Link>
          <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <User className="h-5 w-5" />
            Profile
          </Link>
          <Separator className="my-4" />
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
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
