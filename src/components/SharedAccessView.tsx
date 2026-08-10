"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, ExternalLink, Loader2, QrCode } from "lucide-react";
import { getSignedUrlForShareToken } from "@/app/actions/documents";
import { toast } from "sonner";
import { QRCodeModal } from "@/components/QRCodeModal";
import { DocumentThumbnailPreview } from "@/components/DocumentThumbnailPreview";

interface Document {
  id: string;
  name: string;
  category: string;
  created_at: string;
  verification_status?: string;
  url?: string | null;
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
  const [activeQrDoc, setActiveQrDoc] = useState<{ id: string; name: string; status?: string } | null>(null);

  const handleAction = async (docId: string | undefined, type: "preview" | "download", docName: string) => {
    setLoadingDocId(docId || "single");
    setActionType(type);
    try {
      const res = await getSignedUrlForShareToken(token, docId);
      if (res.success && res.signedUrl) {
        if (type === "preview") {
          const isMobileOrAndroid = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          const isPdf = !docName.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i);
          const targetUrl = (isMobileOrAndroid && isPdf)
            ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(res.signedUrl)}`
            : res.signedUrl;

          try {
            const { Capacitor } = await import("@capacitor/core");
            if (Capacitor.isNativePlatform()) {
              const { Browser } = await import("@capacitor/browser");
              await Browser.open({ url: targetUrl });
              return;
            }
          } catch (e) {}

          window.open(targetUrl, "_blank");
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
        <DocumentThumbnailPreview
          documentName={singleDoc.name}
          category={singleDoc.category}
          verificationStatus={singleDoc.verification_status}
          fileUrl={singleDoc.url}
          aspectRatio="card"
          className="w-64 h-44 mb-4"
          onPreview={() => handleAction(undefined, "preview", singleDoc.name)}
        />
        <h3 className="font-bold text-lg">{singleDoc.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Category: {singleDoc.category}
        </p>

        <div className="flex gap-3 mt-8 w-full flex-wrap sm:flex-nowrap">
          <Button
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            disabled={isLoader}
            onClick={() => handleAction(undefined, "download", singleDoc.name)}
          >
            {isLoader && actionType === "download" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download
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
          <Button
            variant="secondary"
            className="gap-2 text-primary"
            onClick={() => setActiveQrDoc({ id: singleDoc.id, name: singleDoc.name, status: singleDoc.verification_status })}
          >
            <QrCode className="h-4 w-4" /> Verify QR
          </Button>
        </div>

        {activeQrDoc && (
          <QRCodeModal
            isOpen={!!activeQrDoc}
            onClose={() => setActiveQrDoc(null)}
            documentId={activeQrDoc.id}
            documentName={activeQrDoc.name}
            verificationStatus={activeQrDoc.status}
          />
        )}
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
                    <DocumentThumbnailPreview
                      documentName={doc.name}
                      category={doc.category}
                      verificationStatus={doc.verification_status}
                      fileUrl={doc.url}
                      aspectRatio="mini"
                      showOverlay={false}
                      className="shrink-0 h-16 w-14 p-1 border border-border/40 bg-muted/20 shadow-xs"
                    />
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
                      onClick={() => setActiveQrDoc({ id: doc.id, name: doc.name, status: doc.verification_status })}
                      title="Verify QR Proof"
                    >
                      <QrCode className="h-4 w-4 text-primary" />
                    </Button>
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
                      className="h-8 w-8 text-primary"
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

      {activeQrDoc && (
        <QRCodeModal
          isOpen={!!activeQrDoc}
          onClose={() => setActiveQrDoc(null)}
          documentId={activeQrDoc.id}
          documentName={activeQrDoc.name}
          verificationStatus={activeQrDoc.status}
        />
      )}
    </div>
  );
}
