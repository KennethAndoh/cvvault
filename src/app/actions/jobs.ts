"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { logAction } from "./audit";

export async function createJob(jobData: {
  employer_id: string;
  title: string;
  description: string;
  company: string;
  location?: string;
  salary?: string;
  type?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .insert([jobData])
    .select()
    .single();

  if (error) {
    console.error("Error creating job:", error);
    return { success: false, error: error.message };
  }

  await logAction(jobData.employer_id, "job_created", { jobId: data.id, title: jobData.title });

  return { success: true, job: data };
}

export async function getJobs(filters?: { status?: string; employer_id?: string }) {
  let query = supabaseAdmin.from("jobs").select("*").order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.employer_id) {
    query = query.eq("employer_id", filters.employer_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching jobs:", error);
    return { success: false, error: error.message };
  }

  return { success: true, jobs: data };
}

export async function getJobById(id: string) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching job by id:", error);
    return { success: false, error: error.message };
  }

  return { success: true, job: data };
}

export async function updateJob(jobId: string, userId: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update(updates)
    .eq("id", jobId)
    .eq("employer_id", userId) // Ensure ownership
    .select()
    .single();

  if (error) {
    console.error("Error updating job:", error);
    return { success: false, error: error.message };
  }

  await logAction(userId, "job_updated", { jobId, updates });

  return { success: true, job: data };
}

export async function deleteJob(jobId: string, userId: string) {
  const { error } = await supabaseAdmin
    .from("jobs")
    .delete()
    .eq("id", jobId)
    .eq("employer_id", userId);

  if (error) {
    console.error("Error deleting job:", error);
    return { success: false, error: error.message };
  }

  await logAction(userId, "job_deleted", { jobId });

  return { success: true };
}

export async function applyForJob(applicationData: {
  job_id: string;
  employee_id: string;
  resume_url?: string;
  cover_letter?: string;
}) {
  // Check if already applied
  const { data: existing } = await supabaseAdmin
    .from("job_applications")
    .select("id")
    .eq("job_id", applicationData.job_id)
    .eq("employee_id", applicationData.employee_id)
    .single();

  if (existing) {
    return { success: false, error: "You have already applied for this job." };
  }

  const { data, error } = await supabaseAdmin
    .from("job_applications")
    .insert([applicationData])
    .select()
    .single();

  if (error) {
    console.error("Error applying for job:", error);
    return { success: false, error: error.message };
  }

  await logAction(applicationData.employee_id, "job_applied", { jobId: applicationData.job_id, applicationId: data.id });

  return { success: true, application: data };
}

export async function getJobApplications(filters: { job_id?: string; employee_id?: string }) {
  let query = supabaseAdmin
    .from("job_applications")
    .select("*, jobs(*), profiles(*)")
    .order("created_at", { ascending: false });

  if (filters.job_id) {
    query = query.eq("job_id", filters.job_id);
  }

  if (filters.employee_id) {
    query = query.eq("employee_id", filters.employee_id);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching applications:", error);
    return { success: false, error: error.message };
  }

  return { success: true, applications: data };
}

export async function updateApplicationStatus(applicationId: string, status: string, employerId: string) {
  const { data, error } = await supabaseAdmin
    .from("job_applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    console.error("Error updating application status:", error);
    return { success: false, error: error.message };
  }

  await logAction(employerId, "application_status_updated", { applicationId, status });

  return { success: true, application: data };
}
