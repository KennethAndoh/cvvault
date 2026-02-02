"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDocuments } from "@/app/actions/documents";
import { getSharingTokens, getProfile } from "@/app/actions/profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  ShieldCheck, 
  Eye, 
  UploadCloud,
  ArrowUpRight,
  Plus,
  Share2,
  Users,
  Search,
  CheckCircle2,
  Loader2,
  Briefcase,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getJobs, getJobApplications } from "@/app/actions/jobs";

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDocs: 0,
    verifiedDocs: 0,
    profileViews: 0,
    activeLinks: 0,
    pendingVerifications: 0,
    jobCount: 0,
    appCount: 0
  });
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    const [docsRes, tokensRes, profileRes, jobsRes, appsRes] = await Promise.all([
      getDocuments(user!.uid),
      getSharingTokens(user!.uid),
      getProfile(user!.uid),
      getJobs({ employer_id: user!.uid }),
      getJobApplications(profile?.role === 'employer' ? { job_id: undefined } : { employee_id: user!.uid })
    ]);

    if (profileRes.success) {
      setProfile(profileRes.profile);
      
      // If we didn't have the role when we first called fetchDashboardData, appsRes might be wrong.
      // But we call it after profile is available or we can just fetch both always and filter.
      // Let's refine the fetch logic.
    }

    if (docsRes.success) {
      const docs = docsRes.documents || [];
      setRecentDocs(docs.slice(0, 4));
      const verified = docs.filter((d: any) => d.metadata?.verification_status === 'verified').length;
      const pending = docs.filter((d: any) => !d.metadata?.verification_status || d.metadata.verification_status === 'pending').length;
      setStats(prev => ({ 
        ...prev, 
        totalDocs: docs.length,
        verifiedDocs: docs.length > 0 ? Math.round((verified / docs.length) * 100) : 0,
        pendingVerifications: pending
      }));
    }

    if (tokensRes.success) {
      setStats(prev => ({ 
        ...prev, 
        activeLinks: (tokensRes.tokens || []).length 
      }));
    }

    if (jobsRes.success) {
      setStats(prev => ({ ...prev, jobCount: (jobsRes.jobs || []).length }));
    }

    if (appsRes.success) {
      setStats(prev => ({ ...prev, appCount: (appsRes.applications || []).length }));
    }
    
    setLoading(false);
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const isEmployer = profile?.role === 'employer';

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEmployer ? "Employer Workspace" : "Dashboard Overview"}
          </h1>
          <p className="text-muted-foreground">
            {isEmployer 
              ? "Verify credentials and manage talent sharing links." 
              : "Manage your credentials and track sharing activity."}
          </p>
        </div>
        {isEmployer && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium text-sm">
            <Users className="h-4 w-4" />
            Verified Employer Account
          </div>
        )}
      </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isEmployer ? "Active Job Posts" : "Total Documents"}
              </CardTitle>
              {isEmployer ? <Briefcase className="h-4 w-4 text-muted-foreground" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isEmployer ? stats.jobCount : stats.totalDocs}</div>
              <p className="text-xs text-muted-foreground">
                {isEmployer ? "Open positions" : "Across all categories"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isEmployer ? "Total Applicants" : "Job Applications"}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appCount}</div>
              <p className="text-xs text-muted-foreground">
                {isEmployer ? "Across all job posts" : "Active submissions"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isEmployer ? "Candidates Saved" : "Profile Views"}
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.profileViews}</div>
              <p className="text-xs text-muted-foreground">
                {isEmployer ? "Across talent pool" : "Total external visits"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isEmployer ? "Active Links" : "Verified Documents"}
              </CardTitle>
              {isEmployer ? <UploadCloud className="h-4 w-4 text-muted-foreground" /> : <ShieldCheck className="h-4 w-4 text-green-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isEmployer ? stats.activeLinks : `${stats.verifiedDocs}%`}</div>
              <p className="text-xs text-muted-foreground">
                {isEmployer ? "Shared access points" : "Verification completion"}
              </p>
            </CardContent>
          </Card>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{isEmployer ? "Recent Talent Activity" : "Recent Documents"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentDocs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {isEmployer ? "No candidate documents found." : "No documents uploaded yet."}
                </div>
              ) : recentDocs.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium truncate max-w-[200px]">{doc.name}</div>
                      <div className="text-xs text-muted-foreground">{doc.category} • {new Date(doc.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/documents">
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <Link href="/dashboard/documents">
                {isEmployer ? "View All Candidate Docs" : "View All Documents"}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEmployer ? (
              <>
                <Button className="w-full justify-start gap-2" size="lg" asChild>
                  <Link href="/dashboard/jobs">
                    <Plus className="h-5 w-5" />
                    Post New Job
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="lg" asChild>
                  <Link href="/dashboard/jobs">
                    <Briefcase className="h-5 w-5" />
                    Manage Job Listings
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button className="w-full justify-start gap-2" size="lg" asChild>
                  <Link href="/dashboard/jobs">
                    <Search className="h-5 w-5" />
                    Browse All Jobs
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" size="lg" asChild>
                  <Link href="/dashboard/jobs">
                    <Clock className="h-5 w-5" />
                    Track Applications
                  </Link>
                </Button>
              </>
            )}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 pt-4">
                <div className="text-sm font-medium mb-1 text-primary">
                  {isEmployer ? "Employer Tip" : "Pro Tip"}
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  {isEmployer 
                    ? "Verified documents carry a CVVault seal of trust, speeding up your vetting process."
                    : "You can share specific documents or your entire verified profile with recruiters."}
                </div>
                <Button size="sm" className="w-full" variant="secondary" asChild>
                  <Link href="/dashboard/sharing">
                    {isEmployer ? "Manage Recruitment" : "Manage Access"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
