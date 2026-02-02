"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, File, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export function FileUpload({ onFileSelect, accept, maxSize = 10 * 1024 * 1024 }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
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
    onFileSelect(null);
  };

  return (
    <div className="w-full">
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
              PDF, DOCX, JPG, PNG (Max 10MB)
            </p>
          </div>
        </div>
      ) : (
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
