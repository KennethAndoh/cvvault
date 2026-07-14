"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, ExternalLink, Loader2 } from "lucide-react";
import { getSignedUrlForShareToken } from "@/app/actions/documents";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  category: string;
  created_at: string;
}

interface SharedAccessViewProps {
  token: string;
  ownerName: string;
  isFullProfile: boolean;
  singleDoc?: Document;
  documents?: Document[];
}

export function SharedAccessView({
  token,
  ownerName,
  isFullProfile,
  singleDoc,
  documents = [],
}: SharedAccessViewProps) {
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"preview" | "download" | null>(null);

  const handleAction = async (docId: string | undefined, type: "preview" | "download", docName: string) => {
    setLoadingDocId(docId || "single");
    setActionType(type);
    try {
      const res = await getSignedUrlForShareToken(token, docId);
      if (res.success && res.signedUrl) {
        if (type === "preview") {
          window.open(res.signedUrl, "_blank");
        } else {
          // Download the file
          const response = await fetch(res.signedUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = docName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("Download started");
        }
      } else {
        toast.error(res.error || "Action failed");
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setLoadingDocId(null);
      setActionType(null);
    }
  };

  if (!isFullProfile && singleDoc) {
    const isLoader = loadingDocId === "single";
    return (
      <div className="p-6 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center text-center">
        <div className="p-4 bg-background rounded-full shadow-sm mb-4">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <h3 className="font-bold text-lg">{singleDoc.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Category: {singleDoc.category}
        </p>

        <div className="flex gap-3 mt-8 w-full">
          <Button
            className="flex-1 gap-2 bg-[#3482BE] hover:bg-[#2a699a]"
            disabled={isLoader}
            onClick={() => handleAction(undefined, "download", singleDoc.name)}
          >
            {isLoader && actionType === "download" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download Securely
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            disabled={isLoader}
            onClick={() => handleAction(undefined, "preview", singleDoc.name)}
          >
            {isLoader && actionType === "preview" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            Preview
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg text-foreground px-1">Shared Portfolio</h3>
      {documents.length === 0 ? (
        <div className="text-center py-8 bg-muted/20 border border-dashed rounded-xl">
          <p className="text-sm text-muted-foreground">No documents found in this portfolio.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => {
            const isLoader = loadingDocId === doc.id;
            return (
              <Card key={doc.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-bold text-sm truncate" title={doc.name}>
                        {doc.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        {doc.category}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={isLoader}
                      onClick={() => handleAction(doc.id, "preview", doc.name)}
                      title="Preview"
                    >
                      {isLoader && actionType === "preview" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#3482BE]"
                      disabled={isLoader}
                      onClick={() => handleAction(doc.id, "download", doc.name)}
                      title="Download"
                    >
                      {isLoader && actionType === "download" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
