import React from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { generateDocumentProofToken, verifyDocumentProofToken } from "@/lib/verification-proof";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck, FileText, User, Calendar, Lock, AlertTriangle, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DocumentVerificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ proof?: string }>;
}) {
  const { id } = await params;
  const { proof } = await searchParams;

  // 1. Fetch document from DB
  const { data: doc, error: docError } = await supabaseAdmin
    .from("documents")
    .select("*, profiles:user_id(full_name, email, role)")
    .eq("id", id)
    .single();

  if (docError || !doc) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto p-3 bg-destructive/10 rounded-full w-fit mb-2">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Document Not Found</CardTitle>
            <CardDescription>
              The credential ID specified could not be verified in the CVVault ledger.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // 2. Compute official proof token
  const proofData = {
    documentId: doc.id,
    userId: doc.user_id,
    storagePath: doc.storage_path,
    createdAt: doc.created_at,
    verificationStatus: doc.verification_status || "pending",
    docName: doc.name,
  };

  const computedProof = generateDocumentProofToken(proofData);
  const isProofValid = proof ? verifyDocumentProofToken(proofData, proof) : true;
  const owner = doc.profiles;
  const isVerified = doc.verification_status === "verified";

  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  return (
    <div className="min-h-screen bg-muted/30 pb-16">
      {/* Top Header */}
      <header className="bg-background border-b h-16 flex items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded" />
          <span>CVVault <span className="text-xs font-normal text-muted-foreground ml-1">Verification Ledger</span></span>
        </Link>
        <Badge variant="outline" className="gap-1 border-primary/30 text-primary">
          <ShieldCheck className="h-3.5 w-3.5" /> Public Verifier
        </Badge>
      </header>

      <div className="container max-w-2xl mx-auto mt-10 px-4">
        <Card className="shadow-lg border-2 border-primary/20">
          <CardHeader className="text-center pb-4 border-b bg-primary/5">
            <div className="mx-auto p-3 bg-emerald-500/10 text-emerald-600 rounded-full w-fit mb-3 flex items-center justify-center">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <CardTitle className="text-2xl font-bold">Credential Verification Proof</CardTitle>
            </div>
            <CardDescription className="text-sm">
              Public Ledger Audit Record for Document #{doc.id.substring(0, 8)}
            </CardDescription>

            {isProofValid ? (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold text-xs rounded-full border border-emerald-500/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Cryptographically Authentic & Intact
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold text-xs rounded-full border border-amber-500/30">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Proof Digest Mismatch
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Document Details Grid */}
            <div className="grid gap-4 sm:grid-cols-2 bg-background p-4 rounded-lg border">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold block mb-1">Document Name</span>
                <p className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  {doc.name}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold block mb-1">Category</span>
                <Badge variant="secondary" className="capitalize">
                  {doc.category || "General Credential"}
                </Badge>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold block mb-1">Credential Holder</span>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {owner?.full_name || "CVVault Member"}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold block mb-1">Verification Status</span>
                {isVerified ? (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    Verified Credential
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-500">
                    {doc.verification_status || "Pending Verification"}
                  </Badge>
                )}
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground uppercase font-semibold block mb-1">Vault Record Created</span>
                <p className="text-sm text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(doc.created_at).toLocaleString(undefined, {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            {/* Cryptographic Hash Section */}
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold block flex items-center gap-1">
                <Lock className="h-3 w-3" /> HMAC-SHA256 Ledger Digest
              </span>
              <div className="p-3 bg-muted font-mono text-xs break-all rounded border text-muted-foreground select-all">
                {computedProof}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 border-t bg-muted/20 pt-4">
            <Button asChild variant="outline" size="sm">
              <Link href="/" className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Home
              </Link>
            </Button>

            {owner?.id && (
              <Button asChild size="sm" className="gap-1.5">
                <Link href={`/p/${owner.id}`}>
                  View Candidate Profile <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
