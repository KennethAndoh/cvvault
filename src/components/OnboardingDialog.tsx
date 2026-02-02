"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, FileText, Share2, ShieldCheck } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";

interface OnboardingDialogProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingDialog({ userId, isOpen, onClose }: OnboardingDialogProps) {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Welcome to CVVault",
      description: "Securely store and share your professional credentials. Let's get you set up in seconds.",
      icon: <CheckCircle2 className="h-12 w-12 text-primary" />
    },
    {
      title: "Upload Documents",
      description: "Upload your CV, degree certificates, and identification. We support PDF, DOCX, and images.",
      icon: <FileText className="h-12 w-12 text-primary" />
    },
    {
      title: "Controlled Sharing",
      description: "Create secure links for employers. Set expiration dates and revoke access anytime.",
      icon: <Share2 className="h-12 w-12 text-primary" />
    }
  ];

  const handleComplete = async () => {
    await updateProfile(userId, { onboarding_completed: true });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleComplete()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="mb-4 p-3 bg-primary/10 rounded-full">
            {steps[step - 1].icon}
          </div>
          <DialogTitle className="text-2xl">{steps[step - 1].title}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {steps[step - 1].description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 w-2 rounded-full transition-all ${step === i + 1 ? "bg-primary w-6" : "bg-muted"}`} 
            />
          ))}
        </div>

        <DialogFooter className="sm:justify-center">
          {step < steps.length ? (
            <Button className="w-full" onClick={() => setStep(step + 1)}>
              Next
            </Button>
          ) : (
            <Button className="w-full" onClick={handleComplete}>
              Get Started
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
