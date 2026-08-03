"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { runDocumentOcr } from "@/app/actions/ocr";
import { ParsedDocumentMetadata } from "@/lib/ocr-parser";

interface FileUploadProps {
  onFileSelect: (file: File | null, parsedMeta?: ParsedDocumentMetadata) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function FileUpload({ onFileSelect, accept, maxSize = 10 * 1024 * 1024 }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOcrParsing, setIsOcrParsing] = useState(false);
  const [ocrMeta, setOcrMeta] = useState<ParsedDocumentMetadata | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setIsOcrParsing(true);
      setOcrMeta(null);

      // Run OCR Auto-Parsing
      const res = await runDocumentOcr(file.name);
      setIsOcrParsing(false);

      if (res.success && res.data) {
        setOcrMeta(res.data);
        onFileSelect(file, res.data);
      } else {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: accept || {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"]
    },
    maxFiles: 1,
    maxSize
  });

  const removeFile = () => {
    setSelectedFile(null);
    setOcrMeta(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full space-y-3">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4 ${
            isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="p-4 bg-primary/10 rounded-full">
            <UploadCloud className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-lg font-semibold">
              {isDragActive ? "Drop your file here" : "Click or drag to upload"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              PDF, DOCX, JPG, PNG (Max 10MB) • Includes AI OCR Auto-Parsing
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="border rounded-xl p-4 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-primary/10 rounded">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="font-medium truncate text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile} className="shrink-0">
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
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] uppercase">
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
      
      {fileRejections.length > 0 && (
        <p className="text-xs text-destructive mt-2">
          {fileRejections[0].errors[0].code === "file-too-large" 
            ? "File is too large (max 10MB)"
            : "Invalid file type"}
        </p>
      )}
    </div>
  );
}

