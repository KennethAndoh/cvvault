"use client";

import React, { useState, useEffect, use } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  FileText, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { getJobById, getJobApplications, updateApplicationStatus } from "@/app/actions/jobs";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      fetchData();
    }
  }, [user, id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const jobRes = await getJobById(id);
      if (jobRes.success) {
        setJob(jobRes.job);
        
        // Ensure only the owner can view detailed applications
        if (jobRes.job.employer_id !== user!.uid) {
           window.location.href = "/dashboard/jobs";
           return;
        }

        const appsRes = await getJobApplications({ job_id: id });
        if (appsRes.success) {
          setApplications(appsRes.applications || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId: string, status: string) => {
    try {
      const res = await updateApplicationStatus(appId, status, user!.uid);
      if (res.success) {
        toast.success("Status Updated", {
          description: `Application status changed to ${status}.`
        });
        fetchData();
      }
    } catch (err) {
      toast.error("Error", {
        description: "Could not update status."
      });
    }
  };

  if (loading) {
    return <div className="p-8 animate-pulse space-y-4">
      <div className="h-8 w-64 bg-muted rounded"></div>
      <div className="h-48 bg-muted rounded"></div>
    </div>;
  }

  if (!job) return <div>Job not found</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link href="/dashboard/jobs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{job.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <span className="font-medium text-foreground">{job.company}</span>
            <span>•</span>
            <span>{job.location}</span>
            <span>•</span>
            <Badge variant="outline">{job.type}</Badge>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}</p>
          <p className="text-lg font-bold text-primary mt-1">{applications.length} Applicants</p>
        </div>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Applicants</h2>
        {applications.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
            <CardTitle>No applicants yet</CardTitle>
            <CardDescription>When people apply, they will appear here.</CardDescription>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card key={app.id} className="group hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                        {app.profiles?.full_name?.[0] || "?"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{app.profiles?.full_name || "Anonymous User"}</h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {app.profiles?.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right hidden md:block mr-4">
                        <Badge variant={
                          app.status === "accepted" ? "default" : 
                          app.status === "rejected" ? "destructive" : "secondary"
                        } className={cn(
                          "px-3 py-1",
                          app.status === "pending" && "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
                          app.status === "accepted" && "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        )}>
                          {app.status.toUpperCase()}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">Current Status</p>
                      </div>

                      <div className="flex items-center gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2">
                                Actions
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem className="gap-2" onClick={() => handleStatusUpdate(app.id, "accepted")}>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Accept Applicant
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2" onClick={() => handleStatusUpdate(app.id, "reviewed")}>
                                <Clock className="h-4 w-4 text-blue-500" />
                                Mark as Reviewed
                              </DropdownMenuItem>
                              <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleStatusUpdate(app.id, "rejected")}>
                                <XCircle className="h-4 w-4" />
                                Reject Applicant
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                         </DropdownMenu>

                         <Button size="sm" className="bg-[#3482BE] hover:bg-[#2a699a] gap-2" asChild>
                           <Link href={`/p/${app.employee_id}`} target="_blank">
                             <FileText className="h-4 w-4" />
                             View Profile
                           </Link>
                         </Button>
                      </div>
                    </div>
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
