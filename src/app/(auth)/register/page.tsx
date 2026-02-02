"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { syncUserProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { toast } from "sonner";
import { Briefcase, User, ArrowRight, ArrowLeft, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"employee" | "employer" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });
      
        const result = await syncUserProfile(user.uid, email, fullName, role);
        
        if (result.success) {
          // Set flag for onboarding
          if (typeof window !== "undefined") {
            sessionStorage.setItem("cvvault_new_registration", "true");
          }
          toast.success("Account created successfully!");
          router.push("/dashboard");
        } else {
        toast.error("Account created but failed to sync profile.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
      </div>

      <Card className="w-full max-w-md border-primary/20 shadow-xl backdrop-blur-sm bg-card/80">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-6">
            <Link href="/">
              <img src={logoUrl} alt="CVVault Logo" className="h-16 w-16 rounded-2xl shadow-lg transform hover:scale-105 transition-transform" />
            </Link>
          </div>
          <CardTitle className="text-3xl font-bold text-center tracking-tight">
            {step === 1 ? "Choose your role" : "Create your account"}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {step === 1 
              ? "Select how you'll be using CVVault" 
              : `Joining as an ${role === 'employer' ? 'Employer' : 'Employee'}`}
          </CardDescription>
        </CardHeader>
        
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <CardContent className="grid gap-4">
                <div 
                  className={`group relative flex flex-col items-center gap-2 p-6 rounded-xl border-2 cursor-pointer transition-all hover:bg-primary/5 ${role === 'employee' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => setRole('employee')}
                >
                  <div className={`p-3 rounded-full ${role === 'employee' ? 'bg-primary text-white' : 'bg-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                    <User className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold">I am an Employee</h3>
                    <p className="text-sm text-muted-foreground">Store and share my professional credentials securely.</p>
                  </div>
                </div>

                <div 
                  className={`group relative flex flex-col items-center gap-2 p-6 rounded-xl border-2 cursor-pointer transition-all hover:bg-primary/5 ${role === 'employer' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  onClick={() => setRole('employer')}
                >
                  <div className={`p-3 rounded-full ${role === 'employer' ? 'bg-primary text-white' : 'bg-muted group-hover:bg-primary/20 group-hover:text-primary'}`}>
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold">I am an Employer</h3>
                    <p className="text-sm text-muted-foreground">Verify credentials and manage talent efficiently.</p>
                  </div>
                </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 mt-8">
                  <Button 

                  className="w-full h-12 text-lg" 
                  disabled={!role} 
                  onClick={() => setStep(2)}
                >
                  Continue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Login
                  </Link>
                </div>
              </CardFooter>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <form onSubmit={handleRegister}>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input 
                      id="full-name" 
                      placeholder="John Doe" 
                      required 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="m@example.com" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                    <Shield className="h-4 w-4 text-primary shrink-0" />
                    <p>Your data is protected by industry-standard encryption and Firebase security.</p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button className="w-full h-12 text-lg" type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Complete Registration"}
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => setStep(1)} type="button">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Change Role
                  </Button>
                </CardFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
