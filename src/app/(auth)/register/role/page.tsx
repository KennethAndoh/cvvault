"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { syncUserProfile } from "@/app/actions/auth";
import { getProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Briefcase, User, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function RoleSelectionPage() {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<"employee" | "employer" | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
        return;
      }
      
      // Check if user already has a profile
      getProfile(user.uid).then((res) => {
        if (res.success && res.profile) {
          router.push("/dashboard"); // Already has a profile
        } else {
          setLoading(false); // New user, proceed with role selection
        }
      });
    }
  }, [user, authLoading, router]);

  const handleContinue = async () => {
    if (!role || !user) return;
    setSubmitting(true);

    try {
      const email = user.email || "";
      const fullName = user.displayName || "User";
      
      const result = await syncUserProfile(user.uid, email, fullName, role);
      
      if (result.success) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("cvvault_new_registration", "true");
        }
        toast.success("Account set up successfully!");
        router.push("/dashboard");
      } else {
        toast.error("Failed to sync profile.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to complete setup");
    } finally {
      setSubmitting(false);
    }
  };

  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-primary/20 shadow-xl backdrop-blur-sm bg-card/80">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-6">
              <Link href="/">
                <img src={logoUrl} alt="CVVault Logo" className="h-16 w-16 rounded-2xl shadow-lg transform hover:scale-105 transition-transform" />
              </Link>
            </div>
            <CardTitle className="text-3xl font-bold text-center tracking-tight">
              One Last Step
            </CardTitle>
            <CardDescription className="text-center text-base">
              Select how you'll be using CVVault
            </CardDescription>
          </CardHeader>
          
          <CardContent className="grid gap-4 mt-2">
            <div 
              className={`group relative flex flex-col items-center gap-2 p-6 rounded-xl border-2 cursor-pointer transition-all hover:bg-primary/5 ${role === 'employee' ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-border'}`}
              onClick={() => setRole('employee')}
            >
              <div className={`p-3 rounded-full ${role === 'employee' ? 'bg-primary text-white' : 'bg-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                <User className="h-6 w-6" />
              </div>
              <div className="text-center">
                <h3 className="font-bold">I am a Job Seeker</h3>
                <p className="text-sm text-muted-foreground">Store and share my professional credentials securely.</p>
              </div>
            </div>

            <div 
              className={`group relative flex flex-col items-center gap-2 p-6 rounded-xl border-2 cursor-pointer transition-all hover:bg-primary/5 ${role === 'employer' ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' : 'border-border'}`}
              onClick={() => setRole('employer')}
            >
              <div className={`p-3 rounded-full ${role === 'employer' ? 'bg-primary text-white' : 'bg-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="text-center">
                <h3 className="font-bold">I am a Recruiter</h3>
                <p className="text-sm text-muted-foreground">Verify credentials and manage talent efficiently.</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="mt-4">
            <Button 
              className="w-full h-12 text-lg group" 
              disabled={!role || submitting} 
              onClick={handleContinue}
            >
              {submitting ? "Setting up..." : (
                <>
                  Complete Setup <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
