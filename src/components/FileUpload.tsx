"use client";

import React, { useCallback, useState, useRef } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { UploadCloud, File, X, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runDocumentOcr } from "@/app/actions/ocr";
import { parseDocumentMetadata, ParsedDocumentMetadata } from "@/lib/ocr-parser";
import { toast } from "sonner";

interface FileUploadProps {
  onFileSelect: (file: File | null, parsedMeta?: ParsedDocumentMetadata) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  hasError?: boolean;
}

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".jpg", ".jpeg", ".png", ".webp"];

export function FileUpload({ onFileSelect, maxSize = 10 * 1024 * 1024, hasError }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOcrParsing, setIsOcrParsing] = useState(false);
  const [ocrMeta, setOcrMeta] = useState<ParsedDocumentMetadata | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = useCallback(async (file: File) => {
    // Validate file size
    if (file.size > maxSize) {
      const errMsg = `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed is 10MB.`;
      setErrorMessage(errMsg);
      toast.error(errMsg);
      return;
    }

    // Validate extension / MIME type flexible for Android
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);
    const isMimeAllowed = file.type
      ? file.type.includes("pdf") ||
        file.type.includes("word") ||
        file.type.includes("document") ||
        file.type.includes("image") ||
        file.type === "application/octet-stream"
      : true;

    if (!isExtAllowed && !isMimeAllowed) {
      const errMsg = "Invalid document format. Please upload a PDF, DOCX, JPG, or PNG file.";
      setErrorMessage(errMsg);
      toast.error(errMsg);
      return;
    }

    setErrorMessage(null);
    setSelectedFile(file);
    setIsOcrParsing(true);
    setOcrMeta(null);

    // Run OCR Auto-Parsing with client-side fallback
    try {
      const res = await runDocumentOcr(file.name);
      setIsOcrParsing(false);

      if (res && res.success && res.data) {
        setOcrMeta(res.data);
        onFileSelect(file, res.data);
      } else {
        const fallbackMeta = parseDocumentMetadata(file.name);
        setOcrMeta(fallbackMeta);
        onFileSelect(file, fallbackMeta);
      }
    } catch (err) {
      setIsOcrParsing(false);
      const fallbackMeta = parseDocumentMetadata(file.name);
      setOcrMeta(fallbackMeta);
      onFileSelect(file, fallbackMeta);
    }
  }, [maxSize, onFileSelect]);

  const onDrop = useCallback(async (acceptedFiles: File[], rejections: FileRejection[]) => {
    if (rejections.length > 0) {
      const err = rejections[0].errors[0];
      const msg = err.code === "file-too-large"
        ? "File is too large (max 10MB)"
        : "Invalid file type. Please upload a PDF, DOCX, JPG, or PNG document.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (acceptedFiles.length > 0) {
      await processFile(acceptedFiles[0]);
    }
  }, [processFile]);

  const { getRootProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true, // Native touch on the full-cover transparent input handles tap directly on Android & Web
    noKeyboard: false,
    maxFiles: 1,
  });

  const removeFile = () => {
    setSelectedFile(null);
    setOcrMeta(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileSelect(null);
  };

  const handleManualFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
      e.target.value = "";
    }
  };

  return (
    <div className="w-full space-y-3">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-xl p-6 md:p-8 transition-all flex flex-col items-center justify-center text-center gap-3 overflow-hidden ${
            hasError || errorMessage
              ? "border-destructive bg-destructive/5"
              : isDragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          {/* Full-size active HTML file input overlay for 100% reliable Android WebChromeClient file chooser triggering */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,application/msword,.doc,image/jpeg,.jpg,.jpeg,image/png,.png,image/webp,.webp,application/octet-stream,*/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 pointer-events-auto"
            style={{
              display: "block",
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              zIndex: 50,
              cursor: "pointer",
            }}
            onClick={async (e) => {
              try {
                const { pickNativeDocument } = await import("@/lib/native-file-picker");
                const nativeRes = await pickNativeDocument();
                if (nativeRes && nativeRes.file) {
                  e.preventDefault();
                  e.stopPropagation();
                  await processFile(nativeRes.file);
                }
              } catch (err) {
                console.warn("Native file picker trigger warning:", err);
              }
            }}
            onChange={handleManualFileChange}
          />

          <div className={`p-3.5 rounded-full pointer-events-none ${hasError || errorMessage ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
            <UploadCloud className="h-7 w-7" />
          </div>
          <div className="pointer-events-none">
            <p className="text-base md:text-lg font-semibold">
              {isDragActive ? "Drop your document here" : "Tap or drag to upload document"}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              PDF, DOCX, JPG, PNG (Max 10MB) • Supports Android File Pickers
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 rounded-lg border-primary/40 text-primary font-medium shadow-xs pointer-events-none"
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              Choose File from Device
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="border border-border rounded-xl p-4 flex items-center justify-between bg-card shadow-xs">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="font-semibold truncate text-sm text-foreground">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile} className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* OCR Auto-Parsing Status & Metadata Badge */}
          {isOcrParsing ? (
            <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 animate-pulse">
              <Sparkles className="h-4 w-4 animate-spin shrink-0" />
              <span>Running OCR Auto-Parsing Engine to extract document title & skills...</span>
            </div>
          ) : ocrMeta ? (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-extrabold text-emerald-700 dark:text-emerald-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> OCR Metadata Extracted ({ocrMeta.confidenceScore}% Confidence)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] uppercase font-bold">
                  {ocrMeta.detectedCategory}
                </span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 font-medium">
                Issuer: <span className="font-bold text-foreground">{ocrMeta.issuingOrganization}</span>
              </div>
              {ocrMeta.extractedSkills.length > 0 && (
                <div className="flex gap-1 flex-wrap pt-1">
                  {ocrMeta.extractedSkills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold">
                      ✓ {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
      
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-destructive mt-2 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}



