"use client";

import React, { useState, useEffect, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  User,
  Mail,
  ExternalLink,
  Loader2,
  MessageSquare,
  Download,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createChat } from "@/app/actions/chat";
import { cn } from "@/lib/utils";

// Fetch candidate profile & docs via server actions
async function fetchCandidateData(candidateId: string, viewerId: string) {
  const res = await fetch(`/api/candidate-profile?candidateId=${candidateId}&viewerId=${viewerId}`);
  if (!res.ok) throw new Error("Failed to load candidate data");
  return res.json();
}

export default function CandidateProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: candidateId } = use(params);
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatting, setChatting] = useState(false);
  const [openingDoc, setOpeningDoc] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, candidateId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCandidateData(candidateId, user!.uid);
      if (data.error) {
        toast.error(data.error);
        router.back();
        return;
      }
      setProfile(data.profile);
      setDocuments(data.documents || []);
    } catch (err) {
      toast.error("Could not load candidate profile.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDoc = async (storagePath: string, docId: string) => {
    setOpeningDoc(docId);
    try {
      const res = await fetch(`/api/signed-url?path=${encodeURIComponent(storagePath)}&userId=${user!.uid}`);
      const data = await res.json();
      if (data.signedUrl) {
        window.open(data.signedUrl, "_blank");
      } else {
        toast.error("Could not open document: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      toast.error("Failed to open document.");
    } finally {
      setOpeningDoc(null);
    }
  };

  const handleChat = async () => {
    setChatting(true);
    try {
      const res = await createChat(candidateId, user!.uid);
      if (res.success) {
        toast.success("Chat opened");
        router.push("/dashboard/chats");
      } else {
        toast.error("Failed to start chat: " + res.error);
      }
    } catch (err) {
      toast.error("Failed to start chat.");
    } finally {
      setChatting(false);
    }
  };

  const verificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-500/10 text-green-600 border-0 gap-1 text-[10px]">
            <CheckCircle className="h-3 w-3" /> Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-600 border-0 gap-1 text-[10px]">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-600 border-0 gap-1 text-[10px]">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading candidate profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back + Actions */}
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" className="gap-2 rounded-xl" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          size="sm"
          className="bg-[#3482BE] hover:bg-[#2a699a] gap-2 rounded-xl"
          onClick={handleChat}
          disabled={chatting}
        >
          {chatting ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />}
          Message Candidate
        </Button>
      </div>

      {/* Profile Card */}
      <Card className="border border-border/60">
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-violet-500/20 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
              {(profile.full_name || "?")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">{profile.full_name || "Anonymous"}</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                <Mail className="h-3.5 w-3.5" />
                {profile.email}
              </p>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <div>
        <h2 className="text-base font-bold flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-primary" />
          Uploaded Documents
          <span className="text-xs font-normal text-muted-foreground ml-1">({documents.length})</span>
        </h2>

        {documents.length === 0 ? (
          <Card className="border border-dashed border-border/60">
            <CardContent className="py-12 flex flex-col items-center text-center text-muted-foreground">
              <FileText className="h-8 w-8 mb-2 opacity-30" />
              <p className="text-sm font-medium">No documents uploaded</p>
              <p className="text-xs mt-0.5">This candidate has not uploaded any documents yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="border border-border/60 hover:border-primary/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{doc.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {doc.category || "Document"}
                          </span>
                          {doc.metadata?.verification_status && verificationBadge(doc.metadata.verification_status)}
                          {doc.metadata?.is_public && (
                            <Badge className="bg-blue-500/10 text-blue-600 border-0 text-[10px] gap-1">
                              <Shield className="h-2.5 w-2.5" /> Public
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 rounded-xl border-primary/20 text-primary hover:bg-primary/5 shrink-0"
                      disabled={openingDoc === doc.id}
                      onClick={() => handleOpenDoc(doc.storage_path, doc.id)}
                    >
                      {openingDoc === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ExternalLink className="h-3.5 w-3.5" />
                      )}
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
