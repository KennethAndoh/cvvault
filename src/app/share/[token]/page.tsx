import React from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { logAction } from "@/app/actions/audit";
import { SharedAccessView } from "@/components/SharedAccessView";

export default async function SharedAccessPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: accessToken, error: tokenError } = await supabaseAdmin
    .from("access_tokens")
    .select("*, profiles(id, full_name), documents(*)")
    .eq("token", token)
    .single();

  if (tokenError || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto p-3 bg-destructive/10 rounded-full w-fit mb-2">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle>Invalid or Expired Link</CardTitle>
            <CardDescription>
              This sharing link is no longer valid or has been revoked by the owner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (accessToken.user_id) {
    await logAction(accessToken.user_id, "TOKEN_VIEW", {
      token,
      docId: accessToken.document_id || "full_profile",
    });
  }

  if (accessToken.expires_at && new Date(accessToken.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto p-3 bg-yellow-500/10 rounded-full w-fit mb-2">
              <Lock className="h-8 w-8 text-yellow-500" />
            </div>
            <CardTitle>Link Expired</CardTitle>
            <CardDescription>
              This access token expired on {new Date(accessToken.expires_at).toLocaleDateString()}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">Please contact the owner for a new link.</p>
            <Button asChild className="w-full" variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isFullProfile = !accessToken.document_id;
  const ownerName = accessToken.profiles?.full_name || "a user";

  let documents: { id: string; name: string; category: string; created_at: string }[] = [];
  if (isFullProfile) {
    const { data: userDocs } = await supabaseAdmin
      .from("documents")
      .select("id, name, category, created_at")
      .eq("user_id", accessToken.user_id)
      .order("created_at", { ascending: false });
    documents = userDocs || [];
  }

  const linkedDoc = accessToken.documents;
  const singleDoc = linkedDoc
    ? {
        id: linkedDoc.id,
        name: linkedDoc.name,
        category: linkedDoc.category,
        created_at: linkedDoc.created_at,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <header className="bg-background border-b h-16 flex items-center px-8 sticky top-0 z-10">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-primary font-bold">CVVault</span>
          <span className="text-muted-foreground font-normal">| Shared Access</span>
        </Link>
      </header>

      <div className="container max-w-2xl mx-auto mt-12 px-4">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isFullProfile
                ? `Shared Profile: ${ownerName}`
                : `Shared Document: ${linkedDoc?.name || "Document"}`}
            </CardTitle>
            <CardDescription>
              You have been granted restricted access to view this information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <SharedAccessView
              token={token}
              ownerName={ownerName}
              isFullProfile={isFullProfile}
              singleDoc={singleDoc}
              documents={documents}
            />

            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-4 border-t border-border/50">
              <Lock className="h-3 w-3" />
              Secure session monitored by CVVault Audit System
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
