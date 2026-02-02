"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Briefcase, 
  Plus, 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  ChevronRight, 
  CheckCircle2,
  AlertCircle,
  Building2,
  Trash2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getProfile } from "@/app/actions/profile";
import { createJob, getJobs, getJobApplications, applyForJob, deleteJob, updateJob } from "@/app/actions/jobs";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default function JobsPage() {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostJobOpen, setIsPostJobOpen] = useState(false);
  
  // Job Form State
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    type: "Full-time",
    description: ""
  });

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const profileRes = await getProfile(user!.uid);
      if (profileRes.success) {
        setUserRole(profileRes.profile?.role || "employee");
        
        if (profileRes.profile?.role === "employer") {
          const jobsRes = await getJobs({ employer_id: user!.uid });
          if (jobsRes.success) setJobs(jobsRes.jobs || []);
        } else {
          const jobsRes = await getJobs({ status: "open" });
          if (jobsRes.success) setJobs(jobsRes.jobs || []);
          
          const appsRes = await getJobApplications({ employee_id: user!.uid });
          if (appsRes.success) setApplications(appsRes.applications || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.title || !newJob.company || !newJob.description) {
      toast.error("Missing fields", {
        description: "Please fill in all required fields."
      });
      return;
    }

    try {
      const res = await createJob({
        ...newJob,
        employer_id: user!.uid
      });

      if (res.success) {
        toast.success("Job Posted", {
          description: "Your job has been successfully posted."
        });
        setIsPostJobOpen(false);
        setNewJob({ title: "", company: "", location: "", salary: "", type: "Full-time", description: "" });
        fetchInitialData();
      } else {
        toast.error("Error", {
          description: res.error
        });
      }
    } catch (err) {
      toast.error("Error", {
        description: "Something went wrong."
      });
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      const res = await applyForJob({
        job_id: jobId,
        employee_id: user!.uid,
      });

      if (res.success) {
        toast.success("Application Sent", {
          description: "Your application has been submitted successfully."
        });
        fetchInitialData();
      } else {
        toast.error("Error", {
          description: res.error
        });
      }
    } catch (err) {
      toast.error("Error", {
        description: "Could not apply for job."
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job post?")) return;
    
    try {
      const res = await deleteJob(jobId, user!.uid);
      if (res.success) {
        toast.success("Deleted", { description: "Job post has been removed." });
        fetchInitialData();
      }
    } catch (err) {
      toast.error("Error", { description: "Could not delete job." });
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Board</h1>
          <p className="text-muted-foreground mt-1">
            {userRole === "employer" 
              ? "Manage your job listings and view applications." 
              : "Discover your next career opportunity."}
          </p>
        </div>

        {userRole === "employer" && (
          <Dialog open={isPostJobOpen} onOpenChange={setIsPostJobOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#3482BE] hover:bg-[#2a699a] gap-2">
                <Plus className="h-4 w-4" />
                Post a Job
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <form onSubmit={handlePostJob}>
                <DialogHeader>
                  <DialogTitle>Post a New Job</DialogTitle>
                  <DialogDescription>
                    Fill in the details for the position you're looking to fill.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Job Title *</Label>
                    <Input 
                      id="title" 
                      placeholder="e.g. Senior Software Engineer" 
                      value={newJob.title}
                      onChange={e => setNewJob({...newJob, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="company">Company *</Label>
                      <Input 
                        id="company" 
                        placeholder="Company Name" 
                        value={newJob.company}
                        onChange={e => setNewJob({...newJob, company: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="type">Job Type</Label>
                      <Select value={newJob.type} onValueChange={val => setNewJob({...newJob, type: val})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Full-time">Full-time</SelectItem>
                          <SelectItem value="Part-time">Part-time</SelectItem>
                          <SelectItem value="Contract">Contract</SelectItem>
                          <SelectItem value="Internship">Internship</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        placeholder="e.g. Remote, NY" 
                        value={newJob.location}
                        onChange={e => setNewJob({...newJob, location: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="salary">Salary Range</Label>
                      <Input 
                        id="salary" 
                        placeholder="e.g. $80k - $120k" 
                        value={newJob.salary}
                        onChange={e => setNewJob({...newJob, salary: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Job responsibilities and requirements..." 
                      className="min-h-[120px]"
                      value={newJob.description}
                      onChange={e => setNewJob({...newJob, description: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-[#3482BE] hover:bg-[#2a699a] w-full">Post Job</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search by title, company, or location..." 
          className="pl-10 max-w-md"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="available">
            {userRole === "employer" ? "My Listings" : "Available Jobs"}
          </TabsTrigger>
          {userRole === "employee" && (
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="available">
          {filteredJobs.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                <Briefcase className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg">No jobs found</CardTitle>
              <CardDescription>Try adjusting your search filters.</CardDescription>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="bg-[#3482BE]/10 text-[#3482BE] hover:bg-[#3482BE]/20">
                        {job.type}
                      </Badge>
                      {userRole === "employer" && (
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-1">{job.title}</CardTitle>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mt-1">
                      <Building2 className="h-3.5 w-3.5" />
                      {job.company}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {job.description}
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {job.location || "Remote"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        {job.salary || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t">
                    {userRole === "employer" ? (
                      <Button variant="outline" className="w-full gap-2 group" onClick={() => window.location.href = `/dashboard/jobs/${job.id}`}>
                        View Applications
                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-[#3482BE] hover:bg-[#2a699a]"
                        disabled={applications.some(app => app.job_id === job.id)}
                        onClick={() => handleApply(job.id)}
                      >
                        {applications.some(app => app.job_id === job.id) ? "Applied" : "Apply Now"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications">
          <div className="space-y-4">
            {applications.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-12 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                  <Clock className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">No applications yet</CardTitle>
                <CardDescription>Start applying for jobs to see them here.</CardDescription>
              </Card>
            ) : (
              applications.map((app) => (
                <Card key={app.id} className="overflow-hidden">
                  <div className="flex items-center p-6 gap-6">
                    <div className="hidden sm:flex h-12 w-12 rounded-full bg-primary/10 items-center justify-center text-primary flex-shrink-0">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{app.jobs?.title}</h3>
                        <Badge variant={
                          app.status === "accepted" ? "default" : 
                          app.status === "rejected" ? "destructive" : "secondary"
                        } className={cn(
                          app.status === "pending" && "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20",
                          app.status === "accepted" && "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                        )}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="font-medium text-foreground">{app.jobs?.company}</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {app.jobs?.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
