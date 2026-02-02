import React from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Lock, AlertCircle, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { logAction } from "@/app/actions/audit";

export default async function SharedAccessPage({ params }: { params: { token: string } }) {
  const { token } = params;

  // 1. Fetch Token and related Data
  const { data: accessToken, error: tokenError } = await supabase
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

  // 2. Log View Action
  if (accessToken.profiles?.id) {
    await logAction(accessToken.profiles.id, "TOKEN_VIEW", { 
      token: token, 
      docId: accessToken.document_id || "full_profile" 
    });
  }

  // 3. Check Expiry
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

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <header className="bg-background border-b h-16 flex items-center px-8 sticky top-0 z-10">
         <div className="flex items-center gap-2 font-bold">
            <span className="text-primary">CVVault</span>
            <span className="text-muted-foreground font-normal">| Shared Access</span>
         </div>
      </header>
      
      <div className="container max-w-2xl mx-auto mt-12 px-4">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isFullProfile ? `Shared Profile: ${ownerName}` : `Shared Document: ${accessToken.documents?.name}`}
            </CardTitle>
            <CardDescription>
              You have been granted restricted access to view this information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center text-center">
               <div className="p-4 bg-background rounded-full shadow-sm mb-4">
                 <FileText className="h-10 w-10 text-primary" />
               </div>
               <h3 className="font-bold text-lg">{accessToken.documents?.name || `${ownerName}'s Documents`}</h3>
               <p className="text-sm text-muted-foreground mt-1">
                 {isFullProfile ? "Full portfolio of verified credentials" : `Category: ${accessToken.documents?.category}`}
               </p>
               
               <div className="flex gap-3 mt-8 w-full">
                  <Button className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Download Securely
                  </Button>
                  <Button variant="outline" className="flex-1 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Preview
                  </Button>
               </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
               <Lock className="h-3 w-3" />
               Secure session monitored by CVVault Audit System
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
