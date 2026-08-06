"use client";

import React, { useState, useEffect } from "react";
import { Eye, CheckCircle2, ShieldCheck, Clock, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentThumbnailPreviewProps {
  documentName: string;
  category?: string;
  verificationStatus?: string;
  fileUrl?: string | null;
  fileType?: string;
  createdAt?: string;
  onPreview?: () => void;
  className?: string;
  aspectRatio?: "card" | "mini" | "banner";
  showOverlay?: boolean;
}

export function DocumentThumbnailPreview({
  documentName,
  category = "CV / Resume",
  verificationStatus = "pending",
  fileUrl,
  fileType,
  createdAt,
  onPreview,
  className,
  aspectRatio = "card",
  showOverlay = true,
}: DocumentThumbnailPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [isNative, setIsNative] = useState(false);

  // Detect Android/iOS native WebView on mount
  useEffect(() => {
    const check = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        setIsNative(Capacitor.isNativePlatform());
      } catch {
        setIsNative(false);
      }
    };
    check();
  }, []);

  const isImage = fileUrl && !imageError && (
    fileType?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(documentName) ||
    /\.(jpg|jpeg|png|webp|gif|svg)/i.test(fileUrl)
  );

  // On Android native, iframes cannot render PDFs — use placeholder instead
  const showNativePdfPlaceholder = isNative && fileUrl && !imageError && !isImage;

  const isVerified = verificationStatus === "verified";
  const isRejected = verificationStatus === "rejected";

  // Clean document title for printable ATS preview rendering
  const titleWithoutExt = documentName.replace(/\.[^/.]+$/, "");

  return (
    <div
      onClick={onPreview}
      className={cn(
        "group/thumb relative overflow-hidden border border-border bg-slate-950/20 cursor-pointer select-none flex items-center justify-center p-0 transition-all duration-300 hover:border-primary/40 hover:shadow-xl",
        aspectRatio === "card" && "h-40 w-full rounded-xl",
        aspectRatio === "mini" && "h-16 w-14 rounded-lg",
        aspectRatio === "banner" && "h-48 w-full rounded-xl",
        className
      )}
    >
      {/* Background Subtle Gradient & Grid Pattern */}
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-primary/10 opacity-70 pointer-events-none" />

      {/* Full-Bleed Document Preview Container (Zooms on Hover, Zero Margins) */}
      <div className="w-full h-full relative overflow-hidden flex flex-col justify-between">
        {fileUrl && !imageError ? (
          /* Actual Uploaded Document File Preview (Full Bleed Image or PDF iframe) */
          <div className="relative w-full h-full overflow-hidden bg-slate-900">
            {isImage ? (
              <img
                src={fileUrl}
                alt={documentName}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover/thumb:scale-125"
              />
            ) : showNativePdfPlaceholder ? (
              /* Android native placeholder — iframes can't render PDFs in WebView */
              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-slate-900 select-none">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <FileText className="h-8 w-8 text-primary/70" />
                </div>
                <p className="text-[9px] text-slate-400 font-semibold text-center px-2">Tap to open document</p>
              </div>
            ) : (
              <div className="w-full h-full relative overflow-hidden pointer-events-none select-none">
                <iframe
                  src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                  className="w-[200%] h-[200%] border-none pointer-events-none origin-top-left transform scale-50 group-hover/thumb:scale-[0.58] transition-transform duration-500 ease-out"
                  title={documentName}
                />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/75 via-slate-950/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-1.5 left-1.5 right-1.5 px-2 py-1 bg-slate-950/80 backdrop-blur-xs rounded-md text-[9px] font-semibold text-white truncate flex items-center justify-between gap-1 shadow-sm">
              <span className="truncate">{documentName}</span>
              <span className="text-[7.5px] text-sky-300 uppercase shrink-0 font-bold bg-sky-950/80 px-1 py-0.2 rounded border border-sky-500/30">
                {category}
              </span>
            </div>
          </div>
        ) : (
          /* Full Bleed Mini ATS Printable Document Sheet Layout Representation */
          <div
            className={cn(
              "w-full h-full bg-white dark:bg-slate-900 border-none overflow-hidden text-left flex flex-col justify-between transition-transform duration-500 ease-out transform group-hover/thumb:scale-115",
              aspectRatio === "mini" ? "p-1 text-[6px]" : "p-3 text-[9px]"
            )}
          >
            {/* ATS Document Header Bar */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-1.5">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="font-extrabold tracking-wider uppercase text-primary text-[9px] truncate max-w-[110px]">
                  {titleWithoutExt}
                </span>
                <span className="px-1 py-0.2 rounded bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 font-bold text-[7px] shrink-0 uppercase">
                  {category.slice(0, 10)}
                </span>
              </div>
              <div className="text-[7px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
                <ShieldCheck className="h-2.5 w-2.5 text-sky-600 shrink-0" />
                <span>CVVault Ledger Verified Proof</span>
              </div>
            </div>

            {/* ATS Document Content Blocks (Simulated Paper Resume) */}
            <div className="space-y-1.5 flex-1 min-h-0 overflow-hidden">
              {/* Summary Block */}
              <div>
                <div className="h-1 w-12 bg-slate-300 dark:bg-slate-700 rounded-full mb-1" />
                <div className="space-y-0.5">
                  <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                  <div className="h-1 w-5/6 bg-slate-100 dark:bg-slate-800 rounded-full" />
                </div>
              </div>

              {/* Verified Credentials / Skills Section */}
              <div>
                <div className="h-1 w-16 bg-primary/40 rounded-full mb-1" />
                <div className="flex gap-1 flex-wrap">
                  <div className="h-1.5 w-7 bg-primary/10 rounded-xs border border-primary/20" />
                  <div className="h-1.5 w-9 bg-primary/10 rounded-xs border border-primary/20" />
                  <div className="h-1.5 w-6 bg-primary/10 rounded-xs border border-primary/20" />
                </div>
              </div>

              {/* Work Experience / Details Section */}
              <div className="space-y-0.5">
                <div className="h-1 w-14 bg-slate-300 dark:bg-slate-700 rounded-full" />
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-1 w-4/5 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
            </div>

            {/* Official Verification Watermark Stamp */}
            <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[7px]">
              <span className="text-slate-400 dark:text-slate-500 font-mono">ID: #{documentName.slice(0, 6)}</span>
              {isVerified ? (
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 uppercase tracking-tighter">
                  <CheckCircle2 className="h-2.5 w-2.5" /> Authentic
                </span>
              ) : isRejected ? (
                <span className="font-bold text-rose-500 flex items-center gap-0.5 uppercase">
                  <XCircle className="h-2.5 w-2.5" /> Rejected
                </span>
              ) : (
                <span className="font-bold text-amber-500 flex items-center gap-0.5 uppercase">
                  <Clock className="h-2.5 w-2.5" /> Pending
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Glossy Sheen Overlay Animation on Hover */}
      <div className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/20 dark:via-white/10 to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-500 group-hover/thumb:translate-x-[300%]" />

      {/* Verification Corner Status Pill (hidden in mini mode) */}
      {aspectRatio !== "mini" && (
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white shadow-xs backdrop-blur-xs">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </span>
          ) : isRejected ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/90 text-white shadow-xs backdrop-blur-xs">
              <XCircle className="h-3 w-3" /> Rejected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/90 text-white shadow-xs backdrop-blur-xs">
              <Clock className="h-3 w-3" /> Pending
            </span>
          )}
        </div>
      )}

      {/* Interactive Action Overlay on Hover */}
      {showOverlay && (
        <div className="absolute inset-0 z-20 bg-slate-950/40 backdrop-blur-[2px] opacity-0 group-hover/thumb:opacity-100 transition-all duration-300 flex items-center justify-center p-2">
          <span className="px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg flex items-center gap-1.5 transform scale-95 group-hover/thumb:scale-100 transition-transform duration-300">
            <Eye className="h-3.5 w-3.5" /> Preview Document
          </span>
        </div>
      )}
    </div>
  );
}
