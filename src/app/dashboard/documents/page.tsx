"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDocuments, uploadDocument, deleteDocument, updateDocumentVisibility, getSignedUrlForDocument } from "@/app/actions/documents";
import { getProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  Search,
  Filter,
  MoreVertical,
  Loader2,
  Eye,
  Globe,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Award
} from "lucide-react";
import { DocumentThumbnailPreview } from "@/components/DocumentThumbnailPreview";
import { CertificateExportModal } from "@/components/CertificateExportModal";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { QRCodeModal } from "@/components/QRCodeModal";

import { FileUpload } from "@/components/FileUpload";

const EMPLOYEE_CATEGORIES = [
  { value: "CV / Resume", label: "CV / Resume" },
  { value: "Certificate", label: "Certificates" },
  { value: "National ID", label: "National ID" },
  { value: "Passport", label: "Passport" },
  { value: "Recommendation Letter", label: "Recommendation Letter" },
  { value: "Cover Letter", label: "Cover Letter" },
  { value: "Other Supporting Document", label: "Other Supporting Document" },
];

const RECRUITER_CATEGORIES = [
  { value: "Job Description", label: "Job Description" },
  { value: "Employment Contract", label: "Employment Contract" },
  { value: "Offer Letter", label: "Offer Letter" },
  { value: "Company Policy", label: "Company Policy" },
  { value: "NDA", label: "NDA (Non-Disclosure Agreement)" },
  { value: "Interview Instructions", label: "Interview Instructions" },
  { value: "Onboarding Document", label: "Onboarding Document" },
  { value: "Other Company Document", label: "Other Company Document" },
];

export default function DocumentsPage() {
  const { user, profile } = useAuth();
  const [userRole, setUserRole] = useState<string>("employee");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("CV / Resume");
  const [docName, setDocName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [activeQrDoc, setActiveQrDoc] = useState<{ id: string; name: string; status?: string } | null>(null);
  const [activeCertDoc, setActiveCertDoc] = useState<{ name: string; category?: string } | null>(null);

  // Document inline preview states
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");
  const [previewType, setPreviewType] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const isNativeRef = useRef(false);

  // Detect Capacitor native platform (Android/iOS) on mount
  useEffect(() => {
    const checkNative = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        isNativeRef.current = Capacitor.isNativePlatform();
      } catch {
        isNativeRef.current = false;
      }
    };
    checkNative();
  }, []);

  const handleOpenPreview = async (path: string, name: string, type?: string, existingUrl?: string) => {
    setPreviewLoading(true);
    try {
      let urlToUse = existingUrl || null;
      const result = await getSignedUrlForDocument(path, user!.uid);
      if (result.success && result.signedUrl) {
        urlToUse = result.signedUrl;
      }

      if (urlToUse) {
        const resolvedType = type || "application/pdf";
        // On Android native, PDFs can't be rendered in iframes — open in external browser instead
        if (isNativeRef.current && !resolvedType.startsWith("image/")) {
          const { Browser } = await import("@capacitor/browser");
          await Browser.open({ url: urlToUse });
          return;
        }
        setPreviewUrl(urlToUse);
        setPreviewName(name);
        setPreviewType(resolvedType);
      } else {
        toast.error(result.error || "Could not generate preview link");
      }
    } catch (error) {
      if (existingUrl) {
        setPreviewUrl(existingUrl);
        setPreviewName(name);
        setPreviewType(type || "application/pdf");
      } else {
        toast.error("Failed to generate preview");
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 1;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  useEffect(() => {
    if (profile?.role) {
      setUserRole(profile.role);
      setCategory(profile.role === "employer" ? "Job Description" : "CV / Resume");
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    setLoading(true);
    const docsRes = await getDocuments(user!.uid);

    if (docsRes.success) {
      setDocuments(docsRes.documents || []);
    } else {
      toast.error("Failed to fetch documents");
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", docName || file.name);
      formData.append("category", category);

      const result = await uploadDocument(user.uid, formData);

      if (result.success) {
        toast.success("Document uploaded successfully!");
        setIsDialogOpen(false);
        setFile(null);
        setDocName("");
        fetchDocuments();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, path: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    const result = await deleteDocument(id, path, user!.uid);
    if (result.success) {
      toast.success("Document deleted");
      fetchDocuments();
    } else {
      toast.error("Delete failed");
    }
  };

  const handleDownload = async (path: string, name: string, existingUrl?: string) => {
    try {
      let downloadUrl = existingUrl || null;
      const result = await getSignedUrlForDocument(path, user!.uid);
      if (result.success && result.signedUrl) {
        downloadUrl = result.signedUrl;
      }
      if (!downloadUrl) {
        toast.error("Download failed");
        return;
      }
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      if (existingUrl) {
        window.open(existingUrl, "_blank");
      } else {
        toast.error("Download failed");
      }
    }
  };

  const handlePreview = async (path: string) => {
    try {
      const result = await getSignedUrlForDocument(path, user!.uid);
      if (result.success && result.signedUrl) {
        window.open(result.signedUrl, "_blank");
      } else {
        toast.error(result.error || "Could not generate preview link");
      }
    } catch (error) {
      toast.error("Failed to generate preview");
    }
  };

  const handleToggleVisibility = async (id: string, currentIsPublic: boolean) => {
    try {
      const result = await updateDocumentVisibility(id, user!.uid, !currentIsPublic);
      if (result.success) {
        toast.success(`Document made ${!currentIsPublic ? "public" : "private"}`);
        fetchDocuments();
      } else {
        toast.error(result.error || "Failed to update visibility");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesList = userRole === "employer" ? RECRUITER_CATEGORIES : EMPLOYEE_CATEGORIES;
  const isEmployer = userRole === "employer";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isEmployer ? "Company Documents Vault" : "Personal Documents Vault"}
          </h1>
          <p className="text-muted-foreground">
            {isEmployer
              ? "Manage company job descriptions, employment contracts, offer letters, policies, NDAs, and onboarding files."
              : "Manage your resumes, certificates, national ID, passport, recommendation letters, and personal credentials."}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              {isEmployer ? "Upload Company Document" : "Upload Personal Document"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEmployer ? "Upload Company Document" : "Upload Personal Document"}
              </DialogTitle>
              <DialogDescription>
                {isEmployer
                  ? "Upload recruitment files, contracts, or policies for candidate distribution."
                  : "Upload personal career documents and identity credentials to your secure vault."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="doc-name">Document Name</Label>
                <Input 
                  id="doc-name" 
                  placeholder={isEmployer ? "e.g. Senior Dev Job Description v2" : "e.g. Updated Resume 2026"} 
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesList.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
                <div className="space-y-2">
                  <Label>File (PDF, DOCX, JPEG, PNG)</Label>
                  <FileUpload
                    onFileSelect={(selectedFile, parsedMeta) => {
                      setFile(selectedFile);
                      if (parsedMeta) {
                        if (parsedMeta.extractedTitle && !docName) {
                          setDocName(parsedMeta.extractedTitle);
                        }
                        if (parsedMeta.detectedCategory) {
                          setCategory(parsedMeta.detectedCategory);
                        }
                      }
                    }}
                  />
                </div>
              <DialogFooter>
                <Button type="submit" disabled={uploading} className="w-full">
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documents..." 
            className="pl-10 w-full" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Categories" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoriesList.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-muted rounded-full mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No documents found</h3>
            <p className="text-muted-foreground mb-6">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="overflow-hidden border border-border bg-card shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/20 flex flex-col justify-between">
              {/* Card visual header (Zoomed Live Uploaded Document Preview) */}
              <DocumentThumbnailPreview
                documentName={doc.name}
                category={doc.category}
                verificationStatus={doc.metadata?.verification_status}
                fileUrl={doc.url}
                fileType={doc.metadata?.type}
                createdAt={doc.created_at}
                onPreview={() => handleOpenPreview(doc.storage_path, doc.name, doc.metadata?.type, doc.url)}
                className="h-44 rounded-b-none border-x-0 border-t-0"
              />

              {/* Card main content */}
              <CardContent className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base truncate flex-1 text-card-foreground" title={doc.name}>
                      {doc.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full font-semibold">
                      {doc.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatFileSize(doc.metadata?.size)}
                    </span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mt-4 pt-3 border-t border-border">
                  {/* Share option bar */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                      {doc.metadata?.is_public ? (
                        <>
                          <Globe className="h-3.5 w-3.5 text-primary" />
                          Public Profile
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          Private
                        </>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={!!doc.metadata?.is_public}
                        onCheckedChange={() => handleToggleVisibility(doc.id, !!doc.metadata?.is_public)}
                      />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1.5 w-full pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1 h-8 text-xs font-semibold" 
                      onClick={() => handleOpenPreview(doc.storage_path, doc.name, doc.metadata?.type, doc.url)}
                    >
                      <Eye className="h-3.5 w-3.5" /> Preview
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-primary hover:bg-primary/10"
                      onClick={() => setActiveQrDoc({ id: doc.id, name: doc.name, status: doc.metadata?.verification_status })}
                      title="Verify QR Proof"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                    </Button>
                    {doc.metadata?.verification_status === "verified" && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-8 w-8 text-amber-500 hover:bg-amber-500/10 border-amber-500/30"
                        onClick={() => setActiveCertDoc({ name: doc.name, category: doc.category })}
                        title="Export Official Signed Certificate"
                      >
                        <Award className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleDownload(doc.storage_path, doc.name, doc.url)}
                      title="Download"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                      onClick={() => handleDelete(doc.id, doc.storage_path)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Proof Modal */}
      {activeQrDoc && (
        <QRCodeModal
          isOpen={!!activeQrDoc}
          onClose={() => setActiveQrDoc(null)}
          documentId={activeQrDoc.id}
          documentName={activeQrDoc.name}
          verificationStatus={activeQrDoc.status}
        />
      )}

      {/* Certificate Export Modal */}
      {activeCertDoc && (
        <CertificateExportModal
          isOpen={!!activeCertDoc}
          onClose={() => setActiveCertDoc(null)}
          documentName={activeCertDoc.name}
          category={activeCertDoc.category}
          userName={profile?.full_name || "Verified Candidate"}
          userEmail={user?.email || "candidate@cvvault.io"}
        />
      )}

      {/* Lightbox / Previewer Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-6">
          <DialogHeader className="pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold truncate">
              <FileText className="h-5 w-5 text-primary" />
              {previewName}
            </DialogTitle>
            <DialogDescription>
              Previewing the uploaded document file.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full h-full min-h-0 relative bg-muted rounded-lg overflow-hidden flex items-center justify-center mt-4 border">
            {previewUrl && (
              previewType.startsWith("image/") ? (
                <img src={previewUrl} alt={previewName} className="max-h-full max-w-full object-contain" />
              ) : (
                <iframe 
                  src={previewUrl}
                  className="w-full h-full border-none rounded-lg"
                  title={previewName}
                />
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
