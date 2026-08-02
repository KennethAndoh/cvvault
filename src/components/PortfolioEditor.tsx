"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Layout, BookOpen, Link2, Plus, Trash2, Code2, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export interface PortfolioItem {
  id: string;
  type: "github" | "figma" | "publication" | "other";
  title: string;
  url: string;
  description?: string;
  language?: string;
  stars?: number;
  authors?: string;
  publisher?: string;
}

interface PortfolioEditorProps {
  isOpen: boolean;
  onClose: () => void;
  items: PortfolioItem[];
  onSave: (items: PortfolioItem[]) => void;
}

export function PortfolioEditor({ isOpen, onClose, items = [], onSave }: PortfolioEditorProps) {
  const [portfolioList, setPortfolioList] = useState<PortfolioItem[]>(items);
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    type: "github",
    title: "",
    url: "",
    description: "",
    language: "TypeScript",
    stars: 0,
    authors: "",
    publisher: "",
  });

  const handleAddItem = () => {
    if (!newItem.title || !newItem.url) {
      toast.error("Title and URL are required");
      return;
    }

    const itemToAdd: PortfolioItem = {
      id: Math.random().toString(36).substring(2),
      type: (newItem.type as any) || "other",
      title: newItem.title,
      url: newItem.url,
      description: newItem.description,
      language: newItem.language,
      stars: newItem.stars ? Number(newItem.stars) : undefined,
      authors: newItem.authors,
      publisher: newItem.publisher,
    };

    const updated = [...portfolioList, itemToAdd];
    setPortfolioList(updated);
    setNewItem({
      type: "github",
      title: "",
      url: "",
      description: "",
      language: "TypeScript",
      stars: 0,
      authors: "",
      publisher: "",
    });
    toast.success("Portfolio item added");
  };

  const handleRemoveItem = (id: string) => {
    setPortfolioList(portfolioList.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    onSave(portfolioList);
    onClose();
    toast.success("Portfolio updated successfully");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-3 border-b">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Code2 className="h-5 w-5 text-primary" /> Rich Media & Portfolio Showcase Editor
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add GitHub repositories, Figma design portfolios, and research publications to display on your public profile.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
          {/* Add New Item Form */}
          <div className="space-y-4 bg-muted/20 p-4 rounded-lg border">
            <h3 className="font-bold text-sm">Add Portfolio / Work Artifact</h3>
            
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="item-type">Artifact Type</Label>
                <Select
                  value={newItem.type}
                  onValueChange={(val: any) => setNewItem({ ...newItem, type: val })}
                >
                  <SelectTrigger id="item-type">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="github">GitHub Repository</SelectItem>
                    <SelectItem value="figma">Design Portfolio / Figma</SelectItem>
                    <SelectItem value="publication">Research Publication / arXiv</SelectItem>
                    <SelectItem value="other">Custom Link / Web App</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="item-title">Title / Name</Label>
                <Input
                  id="item-title"
                  placeholder="e.g. cv-vault-platform"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="item-url">Artifact URL</Label>
                <Input
                  id="item-url"
                  placeholder="e.g. https://github.com/username/repo or https://figma.com/@project"
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                />
              </div>

              {newItem.type === "github" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="item-lang">Primary Language</Label>
                    <Input
                      id="item-lang"
                      placeholder="e.g. TypeScript, Python, Rust"
                      value={newItem.language}
                      onChange={(e) => setNewItem({ ...newItem, language: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="item-stars">Stars Count (Optional)</Label>
                    <Input
                      id="item-stars"
                      type="number"
                      placeholder="0"
                      value={newItem.stars || ""}
                      onChange={(e) => setNewItem({ ...newItem, stars: Number(e.target.value) })}
                    />
                  </div>
                </>
              )}

              {newItem.type === "publication" && (
                <>
                  <div className="space-y-1">
                    <Label htmlFor="item-authors">Authors</Label>
                    <Input
                      id="item-authors"
                      placeholder="e.g. J. Doe, A. Smith"
                      value={newItem.authors}
                      onChange={(e) => setNewItem({ ...newItem, authors: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="item-pub">Journal / Conference / arXiv ID</Label>
                    <Input
                      id="item-pub"
                      placeholder="e.g. IEEE / arXiv:2401.12345"
                      value={newItem.publisher}
                      onChange={(e) => setNewItem({ ...newItem, publisher: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="item-desc">Brief Description / Abstract Summary</Label>
                <Textarea
                  id="item-desc"
                  rows={2}
                  placeholder="Short description of the repository, design system, or paper..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
            </div>

            <Button size="sm" onClick={handleAddItem} className="gap-1.5 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Artifact Card
            </Button>
          </div>

          {/* Current Items List */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm">Configured Portfolio Items ({portfolioList.length})</h3>
            {portfolioList.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No portfolio items added yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {portfolioList.map((item) => (
                  <Card key={item.id} className="p-3 relative flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          {item.type === "github" && <Github className="h-4 w-4 text-slate-800 dark:text-slate-200 shrink-0" />}
                          {item.type === "figma" && <Layout className="h-4 w-4 text-purple-600 shrink-0" />}
                          {item.type === "publication" && <BookOpen className="h-4 w-4 text-blue-600 shrink-0" />}
                          {item.type === "other" && <Link2 className="h-4 w-4 text-primary shrink-0" />}
                          <h4 className="font-bold text-xs truncate">{item.title}</h4>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive shrink-0"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate mt-1">{item.url}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t text-[10px]">
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {item.type}
                      </Badge>
                      {item.language && <span className="font-semibold text-primary">{item.language}</span>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-3 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} className="gap-2">
            Save Portfolio Showcase
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
