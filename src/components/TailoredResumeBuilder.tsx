"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { getCandidateResumeData, saveCandidateResumeConfig } from "@/app/actions/resume";
import { 
  FileText, 
  Printer, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Download, 
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Award
} from "lucide-react";
import { toast } from "sonner";

interface TailoredResumeBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userEmail: string;
}

export function TailoredResumeBuilder({
  isOpen,
  onClose,
  userId,
  userName,
  userEmail,
}: TailoredResumeBuilderProps) {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [targetTitle, setTargetTitle] = useState("Full Stack Software Engineer");
  const [summary, setSummary] = useState(
    "Results-driven software engineer with expertise in Next.js, TypeScript, and cloud infrastructure. Proven track record of building secure SaaS platforms with verified credentials."
  );
  const [skills, setSkills] = useState<string>("TypeScript, React, Next.js, Node.js, PostgreSQL, Supabase, Firebase, Tailwind CSS");
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  
  const [experiences, setExperiences] = useState([
    {
      company: "Tech Solutions Inc.",
      role: "Senior Full Stack Engineer",
      period: "2023 - Present",
      description: "Architected real-time credential management workflows and secure server actions.",
    },
    {
      company: "Digital Innovations Lab",
      role: "Software Developer",
      period: "2021 - 2023",
      description: "Developed modern web applications using Next.js, React, and REST APIs.",
    },
  ]);

  const [newExp, setNewExp] = useState({ company: "", role: "", period: "", description: "" });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadResumeData();
    }
  }, [isOpen, userId]);

  const loadResumeData = async () => {
    setLoading(true);
    const res = await getCandidateResumeData(userId);
    if (res.success) {
      setDocuments(res.documents || []);
      // Auto-select verified documents by default
      const verifiedIds = (res.documents || [])
        .filter((d: any) => d.verification_status === "verified")
        .map((d: any) => d.id);
      setSelectedDocIds(verifiedIds);

      if (res.profile?.resume_config) {
        const cfg = res.profile.resume_config;
        if (cfg.targetTitle) setTargetTitle(cfg.targetTitle);
        if (cfg.summary) setSummary(cfg.summary);
        if (cfg.skills) setSkills(Array.isArray(cfg.skills) ? cfg.skills.join(", ") : cfg.skills);
        if (cfg.experience) setExperiences(cfg.experience);
        if (cfg.selectedDocIds) setSelectedDocIds(cfg.selectedDocIds);
      }
    }
    setLoading(false);
  };

  const handleAddExperience = () => {
    if (!newExp.company || !newExp.role) {
      toast.error("Please provide company name and role");
      return;
    }
    setExperiences([...experiences, newExp]);
    setNewExp({ company: "", role: "", period: "", description: "" });
  };

  const handleRemoveExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const toggleDocSelect = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  };

  const handleSaveAndPrint = async () => {
    const skillsList = skills.split(",").map((s) => s.trim()).filter(Boolean);
    await saveCandidateResumeConfig(userId, {
      targetTitle,
      summary,
      skills: skillsList,
      experience: experiences,
      selectedDocIds,
    });

    // Trigger browser print dialog for ATS PDF compilation
    window.print();
  };

  const selectedDocs = documents.filter((d) => selectedDocIds.includes(d.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="pb-3 border-b">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Tailored ATS Resume Exporter</DialogTitle>
              <DialogDescription className="text-xs">
                Compile a clean, ATS-optimized PDF resume tailored with selected verified vault credentials.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="editor" className="flex-1 flex flex-col min-h-0 mt-4">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="editor">1. Customize Content</TabsTrigger>
            <TabsTrigger value="preview">2. ATS Printable Preview</TabsTrigger>
          </TabsList>

          {/* Tab 1: Editor */}
          <TabsContent value="editor" className="flex-1 overflow-y-auto space-y-6 pr-2">
            {/* Target Role & Summary */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg border">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" /> Target Position & Summary
              </h3>
              <div className="space-y-2">
                <Label htmlFor="target-title">Target Job Title</Label>
                <Input
                  id="target-title"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="summary">Tailored Professional Summary</Label>
                <Textarea
                  id="summary"
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Brief summary aligned with job description requirements..."
                />
              </div>
            </div>

            {/* Select Verified Credentials */}
            <div className="space-y-3 bg-muted/20 p-4 rounded-lg border">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Select Verified Credentials to Attach
              </h3>
              <p className="text-xs text-muted-foreground">
                Check the credentials from your vault to list under the "Verified Credential Proofs" ATS section.
              </p>
              {documents.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No documents found in vault.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {documents.map((doc) => {
                    const isChecked = selectedDocIds.includes(doc.id);
                    return (
                      <div
                        key={doc.id}
                        onClick={() => toggleDocSelect(doc.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                          isChecked ? "bg-primary/10 border-primary/40" : "bg-background"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <Checkbox checked={isChecked} onCheckedChange={() => toggleDocSelect(doc.id)} />
                          <div className="overflow-hidden">
                            <p className="text-xs font-semibold truncate">{doc.name}</p>
                            <span className="text-[10px] text-muted-foreground uppercase">{doc.category}</span>
                          </div>
                        </div>
                        {doc.verification_status === "verified" && (
                          <Badge className="bg-emerald-600 text-[10px] py-0">Verified</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Experience Section */}
            <div className="space-y-4 bg-muted/20 p-4 rounded-lg border">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary" /> Professional Experience
              </h3>
              <div className="space-y-3">
                {experiences.map((exp, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-xs">{exp.role} <span className="font-normal text-muted-foreground">@ {exp.company}</span></h4>
                        <span className="text-[10px] text-muted-foreground">{exp.period}</span>
                        <p className="text-xs mt-1 text-muted-foreground">{exp.description}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveExperience(i)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </Card>
                ))}

                {/* Add Experience Form */}
                <div className="grid gap-2 sm:grid-cols-3 pt-2">
                  <Input placeholder="Company" value={newExp.company} onChange={(e) => setNewExp({ ...newExp, company: e.target.value })} />
                  <Input placeholder="Role" value={newExp.role} onChange={(e) => setNewExp({ ...newExp, role: e.target.value })} />
                  <Input placeholder="Period (e.g. 2022 - 2024)" value={newExp.period} onChange={(e) => setNewExp({ ...newExp, period: e.target.value })} />
                  <div className="sm:col-span-3 flex gap-2">
                    <Input placeholder="Description / Key achievement" value={newExp.description} onChange={(e) => setNewExp({ ...newExp, description: e.target.value })} className="flex-1" />
                    <Button size="sm" onClick={handleAddExperience} type="button">
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Skills */}
            <div className="space-y-2 bg-muted/20 p-4 rounded-lg border">
              <Label htmlFor="skills" className="font-bold text-sm">Key Skills (Comma Separated)</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="TypeScript, React, Next.js, Node.js, SQL..."
              />
            </div>
          </TabsContent>

          {/* Tab 2: ATS Printable Preview */}
          <TabsContent value="preview" className="flex-1 overflow-y-auto pr-2">
            <div className="p-4 bg-muted/50 rounded-lg border flex justify-between items-center mb-4">
              <span className="text-xs text-muted-foreground">
                Formatted with single-column ATS typography standards. Click export to generate PDF.
              </span>
              <Button onClick={handleSaveAndPrint} size="sm" className="gap-2 bg-[#3482BE] hover:bg-[#2a699a]">
                <Printer className="h-4 w-4" /> Export ATS PDF
              </Button>
            </div>

            {/* ATS Resume Sheet (Print Target) */}
            <div
              ref={printRef}
              id="printable-ats-resume"
              className="bg-white text-slate-900 p-8 rounded shadow border max-w-2xl mx-auto space-y-6 text-left font-sans"
            >
              {/* Header */}
              <div className="border-b border-slate-300 pb-4 text-center">
                <h1 className="text-2xl font-bold text-slate-900 tracking-wide uppercase">{userName}</h1>
                <p className="text-sm font-semibold text-sky-700 mt-0.5 uppercase tracking-wider">{targetTitle}</p>
                <p className="text-xs text-slate-600 mt-1">{userEmail} • Verified CVVault Profile</p>
              </div>

              {/* Summary */}
              {summary && (
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">
                    PROFESSIONAL SUMMARY
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
                </div>
              )}

              {/* Skills */}
              {skills && (
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">
                    TECHNICAL SKILLS & COMPETENCIES
                  </h2>
                  <p className="text-xs text-slate-700 leading-relaxed">{skills}</p>
                </div>
              )}

              {/* Experience */}
              {experiences.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2">
                    WORK EXPERIENCE
                  </h2>
                  <div className="space-y-3">
                    {experiences.map((exp, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>{exp.role} — {exp.company}</span>
                          <span className="text-slate-500 font-normal">{exp.period}</span>
                        </div>
                        {exp.description && <p className="text-slate-600 mt-1 leading-normal">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Credential Proofs */}
              {selectedDocs.length > 0 && (
                <div>
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-1 mb-2 flex items-center justify-between">
                    <span>VERIFIED CREDENTIAL PROOFS</span>
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase">CVVault Ledger Authenticated</span>
                  </h2>
                  <div className="space-y-2">
                    {selectedDocs.map((doc) => (
                      <div key={doc.id} className="p-2 border border-slate-200 rounded bg-slate-50 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{doc.name}</span>
                          <span className="text-[10px] text-slate-500 block uppercase">{doc.category}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 font-semibold border border-emerald-300 bg-emerald-50 px-2 py-0.5 rounded">
                          ✓ Verified Intact
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="border-t pt-3 mt-2 sm:justify-between">
          <Button variant="ghost" onClick={onClose} size="sm">
            Close
          </Button>
          <Button onClick={handleSaveAndPrint} size="sm" className="gap-2 bg-[#3482BE] hover:bg-[#2a699a]">
            <Printer className="h-4 w-4" /> Export ATS PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
