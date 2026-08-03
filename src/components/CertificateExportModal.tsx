"use client";

import React, { useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, ShieldCheck, Award, Download, CheckCircle2, QrCode } from "lucide-react";
import { ZeroDepQRCode } from "@/components/ZeroDepQRCode";

interface CertificateExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  category?: string;
  userName?: string;
  userEmail?: string;
  verificationHash?: string;
  issueDate?: string;
}

export function CertificateExportModal({
  isOpen,
  onClose,
  documentName,
  category = "Verified Credential",
  userName = "Verified Professional",
  userEmail = "user@cvvault.io",
  verificationHash = "0x8F92A7C319E4B051287F",
  issueDate = new Date().toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }),
}: CertificateExportModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const win = window.open("", "", "width=1000,height=750");
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>CVVault Verified Credential Certificate - ${documentName}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                body { margin: 0; padding: 20px; background: white; -webkit-print-color-adjust: exact; }
                @page { size: landscape; margin: 0; }
              }
            </style>
          </head>
          <body className="flex items-center justify-center p-8 bg-white font-serif">
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
        win.close();
      }, 500);
    }
  };

  const verifyUrl = `${typeof window !== "undefined" ? window.location.origin : "https://cvvault.io"}/verify/${documentName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-6 overflow-y-auto">
        <DialogHeader className="pb-3 border-b flex flex-row items-center justify-between">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-amber-500" /> Official Credential Certificate Exporter
            </DialogTitle>
            <DialogDescription>
              Digitally signed A4 landscape certificate with cryptographic QR proof ledger stamp.
            </DialogDescription>
          </div>
          <Button onClick={handlePrint} size="sm" className="gap-2 bg-[#3482BE] hover:bg-[#2a699a]">
            <Printer className="h-4 w-4" /> Download / Print PDF
          </Button>
        </DialogHeader>

        {/* Certificate A4 Landscape Target Printable Container */}
        <div className="py-4">
          <div
            ref={printRef}
            className="w-full max-w-3xl mx-auto bg-white text-slate-900 p-10 rounded-2xl shadow-xl border-8 border-double border-slate-900 relative font-serif text-center space-y-6 select-none"
          >
            {/* Corner Decorative Accents */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600" />
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600" />
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600" />

            {/* Certificate Header */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-sky-700 font-sans tracking-widest text-xs font-bold uppercase">
                <ShieldCheck className="h-4 w-4" /> CVVault Authenticated Ledger System
              </div>
              <h1 className="text-3xl font-black tracking-wider text-slate-900 uppercase font-serif">
                Certificate of Authenticity
              </h1>
              <p className="text-xs text-slate-500 italic">
                This official credential proof has been cryptographically validated and ledger-stamped.
              </p>
            </div>

            {/* Candidate & Document Statement */}
            <div className="space-y-3 py-2 border-y border-slate-200">
              <p className="text-xs text-slate-600 uppercase tracking-widest font-sans font-semibold">
                THIS IS TO CERTIFY THAT
              </p>
              <h2 className="text-2xl font-bold text-slate-900 font-sans tracking-wide">
                {userName}
              </h2>
              <p className="text-xs text-slate-600 font-sans">
                has presented and authenticated the official career credential titled:
              </p>
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-xl inline-block">
                <h3 className="text-lg font-black text-sky-800 font-sans uppercase tracking-wider">
                  {documentName}
                </h3>
                <span className="text-[10px] text-slate-500 font-sans uppercase tracking-widest block mt-0.5">
                  Category: {category}
                </span>
              </div>
            </div>

            {/* Footer Verification Seal & QR Proof */}
            <div className="pt-2 flex items-center justify-between gap-6 text-left font-sans text-xs">
              {/* Left Hash Details */}
              <div className="space-y-1 text-[10px] text-slate-500 font-mono">
                <p><span className="font-bold text-slate-800">Ledger Hash:</span> {verificationHash}</p>
                <p><span className="font-bold text-slate-800">Issue Date:</span> {issueDate}</p>
                <p><span className="font-bold text-slate-800">Status:</span> <span className="text-emerald-700 font-bold">✓ VERIFIED INTACT</span></p>
              </div>

              {/* Center Official Gold Seal */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full border-2 border-dashed border-amber-900 flex flex-col items-center justify-center text-amber-950 font-bold text-[8px] tracking-tighter uppercase text-center p-1 bg-amber-100">
                    <ShieldCheck className="h-5 w-5 text-amber-800" />
                    CVVAULT
                  </div>
                </div>
                <span className="text-[9px] text-slate-500 font-bold mt-1">OFFICIAL SEAL</span>
              </div>

              {/* Right Verification QR */}
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <ZeroDepQRCode value={verifyUrl} size={50} />
                <div className="text-[9px] space-y-0.5">
                  <span className="font-bold text-slate-800 block">Scan to Verify</span>
                  <span className="text-slate-500 block">Tamper-Proof QR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
