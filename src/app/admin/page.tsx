"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { isAdmin, getAllProfiles, getAllDocuments, updateDocumentMetadata } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  Loader2, 
  CheckCircle, 
  XCircle,
  MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (user) {
      checkAuthAndFetch();
    }
  }, [user]);

  const checkAuthAndFetch = async () => {
    setLoading(true);
    const isUserAdmin = await isAdmin(user!.uid);
    
    if (!isUserAdmin) {
      toast.error("Unauthorized access");
      router.push("/dashboard");
      return;
    }

    setAuthorized(true);
    const [profRes, docRes] = await Promise.all([
      getAllProfiles(),
      getAllDocuments()
    ]);

    if (profRes.success) setProfiles(profRes.profiles || []);
    if (docRes.success) setDocuments(docRes.documents || []);
    
    setLoading(false);
  };

  const handleVerify = async (id: string, currentMetadata: any, status: 'verified' | 'rejected') => {
    const newMetadata = { ...currentMetadata, verification_status: status };
    const result = await updateDocumentMetadata(id, newMetadata);
    
    if (result.success) {
      toast.success(`Document ${status}`);
      // Refresh docs
      const docRes = await getAllDocuments();
      if (docRes.success) setDocuments(docRes.documents || []);
    } else {
      toast.error("Operation failed");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!authorized) return null;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Moderation</h1>
          <p className="text-muted-foreground">Monitor users and verify credentials.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-bold w-fit">
          <ShieldCheck className="h-4 w-4" />
          Admin Access
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {documents.filter(d => !d.metadata?.verification_status || d.metadata.verification_status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <div className="h-2 w-2 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Optimal</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none bg-transparent shadow-none">
        <CardHeader className="px-0">
          <CardTitle>Document Verification Queue</CardTitle>
          <CardDescription>Review and verify user credentials.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden md:block rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="font-medium">{doc.profiles?.full_name}</div>
                      <div className="text-xs text-muted-foreground">{doc.profiles?.email}</div>
                    </TableCell>
                    <TableCell className="font-medium">{doc.name}</TableCell>
                    <TableCell>{doc.category}</TableCell>
                    <TableCell>
                      {doc.metadata?.verification_status === 'verified' ? (
                        <span className="flex items-center gap-1 text-green-500 text-xs font-bold">
                          <CheckCircle className="h-3 w-3" /> VERIFIED
                        </span>
                      ) : doc.metadata?.verification_status === 'rejected' ? (
                        <span className="flex items-center gap-1 text-destructive text-xs font-bold">
                          <XCircle className="h-3 w-3" /> REJECTED
                        </span>
                      ) : (
                        <span className="text-yellow-500 text-xs font-bold italic">PENDING</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleVerify(doc.id, doc.metadata, 'verified')}>
                            Verify Document
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleVerify(doc.id, doc.metadata, 'rejected')} className="text-destructive">
                            Reject Document
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Original File
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-card border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm">{doc.name}</div>
                    <div className="text-xs text-muted-foreground">{doc.profiles?.full_name}</div>
                  </div>
                  {doc.metadata?.verification_status === 'verified' ? (
                    <span className="text-green-500"><CheckCircle className="h-5 w-5" /></span>
                  ) : doc.metadata?.verification_status === 'rejected' ? (
                    <span className="text-destructive"><XCircle className="h-5 w-5" /></span>
                  ) : (
                    <span className="text-yellow-500 italic text-[10px] font-bold">PENDING</span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-xs">
                  <span className="px-2 py-0.5 bg-muted rounded-full">{doc.category}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleVerify(doc.id, doc.metadata, 'verified')}>
                      Verify
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive border-destructive/20" onClick={() => handleVerify(doc.id, doc.metadata, 'rejected')}>
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
