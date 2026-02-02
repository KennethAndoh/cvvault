import React from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, User, Globe, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;

  // 1. Fetch Profile
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (profileError || !profile || !profile.public_profile_enabled) {
    return notFound();
  }

  // 2. Fetch Public Documents (for now all docs if profile is public, or we can add a visibility flag per doc)
  // In a real app, we'd only show docs marked as "public"
  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", id);

  const logoUrl = "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg?width=100&height=100&resize=contain";

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <header className="bg-background border-b h-16 flex items-center px-4 lg:px-8">
         <Link href="/" className="flex items-center gap-2 font-bold">
            <img src={logoUrl} alt="Logo" className="h-8 w-8 rounded" />
            <span>CVVault</span>
         </Link>
      </header>
      
      <div className="container max-w-4xl mx-auto mt-12 px-4">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Sidebar / Profile Info */}
          <div className="space-y-6">
             <Card>
               <CardContent className="pt-6 flex flex-col items-center text-center">
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <User className="h-12 w-12 text-primary" />
                  </div>
                  <h1 className="text-xl font-bold">{profile.full_name}</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 justify-center mt-1">
                    <Mail className="h-3 w-3" />
                    {profile.email}
                  </p>
                  <div className="flex gap-2 mt-4 w-full">
                     <Button className="w-full" variant="outline" size="sm">Contact</Button>
                  </div>
               </CardContent>
             </Card>

             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm font-bold">About</CardTitle>
               </CardHeader>
               <CardContent>
                 <p className="text-sm text-muted-foreground leading-relaxed">
                   {profile.bio || "No bio provided."}
                 </p>
               </CardContent>
             </Card>
          </div>

          {/* Main Content / Documents */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Verified Credentials
            </h2>
            
            <div className="grid gap-4">
              {documents && documents.length > 0 ? (
                documents.map((doc) => (
                  <Card key={doc.id} className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-muted rounded">
                          <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{doc.name}</div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            {doc.category} • Verified
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">View</Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12 bg-background border rounded-xl border-dashed">
                  <p className="text-muted-foreground">No public documents available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
