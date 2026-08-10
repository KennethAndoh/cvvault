"use client";

import React, { useState } from "react";
import { 
  User, 
  FileText, 
  ShieldCheck, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  MoreVertical,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MatchScoreBadge } from "@/components/MatchScoreBadge";
import { formatDistanceToNow } from "date-fns";

export interface ApplicationItem {
  id: string;
  employee_id: string;
  job_id: string;
  status: string;
  created_at: string;
  resume_url?: string;
  document_id?: string;
  applicant?: {
    full_name?: string;
    email?: string;
    skills?: string[];
    bio?: string;
  };
  verificationStatus?: string;
}

interface KanbanApplicantPipelineProps {
  applications: ApplicationItem[];
  jobTitle?: string;
  jobSkills?: string[];
  onStatusChange: (applicationId: string, newStatus: string) => void;
  onViewResume: (resumeUrl: string, applicantId: string) => void;
  onVerifyDocument: (resumeUrl: string, applicantName: string) => void;
  onChatCandidate: (employeeId: string, fullName: string) => void;
}

const COLUMNS = [
  { id: "applied", label: "Applied", color: "border-sky-500/40 bg-sky-500/5 text-sky-600 dark:text-sky-400" },
  { id: "shortlisted", label: "Shortlisted", color: "border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-400" },
  { id: "interviewed", label: "Interviewing", color: "border-violet-500/40 bg-violet-500/5 text-violet-600 dark:text-violet-400" },
  { id: "offered", label: "Offered", color: "border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" },
  { id: "hired", label: "Hired", color: "border-teal-500/40 bg-teal-500/5 text-teal-600 dark:text-teal-400" },
];

export function KanbanApplicantPipeline({
  applications = [],
  jobTitle = "Position",
  jobSkills = [],
  onStatusChange,
  onViewResume,
  onVerifyDocument,
  onChatCandidate,
}: KanbanApplicantPipelineProps) {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);

  const normalizeStatus = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s === "pending" || s === "applied") return "applied";
    if (s === "shortlisted") return "shortlisted";
    if (s === "interviewed" || s === "interviewing") return "interviewed";
    if (s === "accepted" || s === "offered") return "offered";
    if (s === "hired") return "hired";
    return "applied";
  };

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData("applicationId", appId);
    setDraggedAppId(appId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData("applicationId") || draggedAppId;
    if (appId) {
      onStatusChange(appId, targetColumnId);
    }
    setDraggedAppId(null);
  };

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold flex items-center gap-2">
            Kanban Candidate Pipeline
          </h3>
          <p className="text-xs text-muted-foreground">
            Drag candidates across stages to update evaluation status in real-time.
          </p>
        </div>
        <Badge variant="outline" className="font-semibold text-xs">
          {applications.length} Total Applicants
        </Badge>
      </div>

      {/* Kanban 5-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colApps = applications.filter(
            (app) => normalizeStatus(app.status) === col.id
          );

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-muted/30 border border-border/60 rounded-2xl p-3 flex flex-col min-h-[420px] transition-colors"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${col.color}`}>
                    {col.label}
                  </span>
                </div>
                <span className="text-xs font-bold text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                  {colApps.length}
                </span>
              </div>

              {/* Column Candidate Cards List */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[520px] pr-1">
                {colApps.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-border/50 rounded-xl flex items-center justify-center text-xs text-muted-foreground italic text-center p-2">
                    Drop candidates here
                  </div>
                ) : (
                  colApps.map((app) => {
                    const applicantName = app.applicant?.full_name || "Applicant";
                    const isVerified = app.verificationStatus === "verified";

                    return (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        className="bg-card border border-border/80 rounded-xl p-3.5 shadow-xs hover:shadow-md transition-all space-y-3 cursor-grab active:cursor-grabbing group hover:border-primary/40"
                      >
                        {/* Header: Name + Menu */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm truncate text-foreground">
                                {applicantName}
                              </span>
                              {isVerified && (
                                <span title="Verified Proof">
                                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground block truncate">
                              {app.applicant?.email || "candidate@cvvault.io"}
                            </span>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-60 group-hover:opacity-100">
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 text-xs">
                              <DropdownMenuLabel>Move Candidate</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {COLUMNS.map((stage) => (
                                <DropdownMenuItem
                                  key={stage.id}
                                  onClick={() => onStatusChange(app.id, stage.id)}
                                  className="gap-2 cursor-pointer"
                                >
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  To {stage.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onStatusChange(app.id, "rejected")}
                                className="text-destructive gap-2 cursor-pointer"
                              >
                                <XCircle className="h-3 w-3" />
                                Reject Application
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* AI Match Score Badge */}
                        <div className="pt-1">
                          <MatchScoreBadge
                            candidateId={app.employee_id}
                            jobId={app.job_id}
                          />
                        </div>

                        {/* Applied Time */}
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        {/* Card Quick Action Bar */}
                        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-1">
                          {app.resume_url ? (
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => onViewResume(app.resume_url!, app.employee_id)}
                              className="text-[11px] h-7 px-2 gap-1 text-sky-600 hover:text-sky-700 dark:text-sky-400"
                            >
                              <FileText className="h-3.5 w-3.5" /> Resume
                            </Button>
                          ) : <div />}

                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => onChatCandidate(app.employee_id, applicantName)}
                            className="text-[11px] h-7 px-2 gap-1 text-primary hover:text-primary/80"
                          >
                            <MessageSquare className="h-3.5 w-3.5" /> Chat
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
