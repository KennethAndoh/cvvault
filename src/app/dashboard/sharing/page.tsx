"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSharingTokens, createSharingToken, deleteSharingToken } from "@/app/actions/profile";
import { getDocuments } from "@/app/actions/documents";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Share2, Trash2, ExternalLink, Copy } from "lucide-react";

export default function SharingPage() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [selectedDoc, setSelectedDoc] = useState("");
  const [expiry, setExpiry] = useState("");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const [tokensRes, docsRes] = await Promise.all([
      getSharingTokens(user!.uid),
      getDocuments(user!.uid)
    ]);

    if (tokensRes.success) setTokens(tokensRes.tokens || []);
    if (docsRes.success) setDocuments(docsRes.documents || []);
    
    setLoading(false);
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const result = await createSharingToken({
      userId: user!.uid,
      documentId: selectedDoc || undefined,
      expiresAt: expiry || undefined,
    });

    if (result.success) {
      toast.success("Sharing token created!");
      setIsDialogOpen(false);
      setSelectedDoc("");
      setExpiry("");
      fetchData();
    } else {
      toast.error("Failed to create token");
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this access?")) return;
    const result = await deleteSharingToken(id, user!.uid);
    if (result.success) {
      toast.success("Access revoked");
      fetchData();
    } else {
      toast.error("Failed to revoke access");
    }
  };

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/share/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Sharing link copied!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sharing & Access</h1>
          <p className="text-muted-foreground">Manage external access tokens and sharing links.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Share2 className="h-4 w-4" />
              Create Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sharing Link</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateToken} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Document (Optional)</Label>
                <Select value={selectedDoc} onValueChange={setSelectedDoc}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Documents (Full Profile)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Documents</SelectItem>
                    {documents.map(doc => (
                      <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiration Date (Optional)</Label>
                <Input 
                  id="expiry" 
                  type="date" 
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={creating} className="w-full">
                  {creating ? "Creating..." : "Generate Link"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : tokens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No active sharing links found.
                  </TableCell>
                </TableRow>
              ) : (
                tokens.map((token) => (
                  <TableRow key={token.id}>
                    <TableCell className="font-medium">
                      {token.documents?.name || "Full Profile"}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] rounded-full font-bold">
                        ACTIVE
                      </span>
                    </TableCell>
                    <TableCell>
                      {token.expires_at ? new Date(token.expires_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      {new Date(token.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => copyLink(token.token)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(token.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
