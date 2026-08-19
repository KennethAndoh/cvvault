"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Copy, Check, ExternalLink, QrCode, Download } from "lucide-react";
import { toast } from "sonner";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  verificationStatus?: string;
  proofToken?: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  documentId,
  documentName,
  verificationStatus,
  proofToken,
}: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  // Construct absolute verification URL
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const verifyUrl = `${baseUrl}/verify/${documentId}${proofToken ? `?proof=${proofToken}` : ""}`;

  // QR Code Image API (using Google Chart / QuickChart public API for high-resolution vector QR SVG)
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    verifyUrl
  )}&color=0284c7`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    toast.success("Verification link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="items-center text-center">
          <div className="p-3 bg-primary/10 rounded-full w-fit mb-2 text-primary">
            <QrCode className="h-8 w-8" />
          </div>
          <DialogTitle className="text-xl font-bold">Tamper-Evident QR Proof</DialogTitle>
          <DialogDescription className="text-sm">
            Scan to instantly verify the cryptographic authenticity of <span className="font-semibold text-foreground">{documentName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center my-4 space-y-4">
          {/* QR Code Container */}
          <div className="p-4 bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-xl shadow-md flex flex-col items-center">
            <img
              src={qrImageUrl}
              alt={`Verification QR Code for ${documentName}`}
              className="w-48 h-48 rounded object-contain"
            />
            <div className="flex items-center gap-1.5 mt-3 text-xs text-emerald-600 font-semibold">
              <ShieldCheck className="h-4 w-4" /> Pryvault Ledger Authenticated
            </div>
          </div>

          {/* Verification Status Badge */}
          {verificationStatus === "verified" && (
            <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-3 py-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified Credential
            </Badge>
          )}

          {/* Link Copy Box */}
          <div className="w-full flex items-center gap-2">
            <Input
              value={verifyUrl}
              readOnly
              className="text-xs font-mono bg-muted select-all pr-2"
            />
            <Button size="icon" variant="outline" onClick={handleCopyLink} title="Copy Link">
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button asChild size="sm" className="gap-1.5">
            <a href={verifyUrl} target="_blank" rel="noopener noreferrer">
              Open Verifier <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
