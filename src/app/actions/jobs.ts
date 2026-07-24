"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { logAction } from "./audit";
import { createChat, sendMessage } from "./chat";
import { 
  sendJobApplicationReceivedNotification, 
  sendApplicationStatusUpdatedNotification 
} from "@/lib/novu";

export async function createJob(jobData: {
  employer_id: string;
  title: string;
  description: string;
  company: string;
  location?: string;
  salary?: string;
  type?: string;
  employees_needed?: number;
}) {
  // Check if user is an employer/recruiter
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", jobData.employer_id)
    .single();

  if (profile?.role === "employee") {
    return { success: false, error: "Employee accounts are not authorized to post jobs." };
  }

  let data: any = null;
  let error: any = null;

  const insertRes = await supabaseAdmin
    .from("jobs")
    .insert([jobData])
    .select()
    .single();

  if (insertRes.error && insertRes.error.message.includes("employees_needed")) {
    const { employees_needed, ...fallbackJobData } = jobData as any;
    const fallbackRes = await supabaseAdmin
      .from("jobs")
      .insert([fallbackJobData])
      .select()
      .single();
    data = fallbackRes.data;
    error = fallbackRes.error;
  } else {
    data = insertRes.data;
    error = insertRes.error;
  }

  if (error) {
    console.error("Error creating job:", error);
    return { success: false, error: error.message };
  }

  await logAction(jobData.employer_id, "job_created", { 
    jobId: data.id, 
    title: jobData.title, 
    employeesNeeded: jobData.employees_needed || 1 
  });

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
  // Check user role: recruiters/employers cannot apply for jobs
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", applicationData.employee_id)
    .single();

  if (profile?.role === "employer") {
    return { success: false, error: "Recruiter accounts cannot apply for job listings." };
  }

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

  // Trigger Novu notification to employer
  try {
    const { data: job } = await supabaseAdmin
      .from("jobs")
      .select("title, employer_id")
      .eq("id", applicationData.job_id)
      .single();

    const { data: applicant } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", applicationData.employee_id)
      .single();

    if (job?.employer_id) {
      const { data: employer } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", job.employer_id)
        .single();

      sendJobApplicationReceivedNotification(
        job.employer_id,
        employer?.email,
        job.title || "Job Listing",
        applicant?.full_name || "An Applicant"
      ).catch((err) => console.error("Novu notification error:", err));
    }
  } catch (notifyErr) {
    console.error("Failed to notify employer via Novu:", notifyErr);
  }

  return { success: true, application: data };
}

export async function getJobApplications(filters: { job_id?: string; employee_id?: string; employer_id?: string }) {
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

  if (filters.employer_id) {
    const { data: jobs } = await supabaseAdmin
      .from("jobs")
      .select("id")
      .eq("employer_id", filters.employer_id);

    const jobIds = jobs?.map((job) => job.id) || [];
    if (jobIds.length === 0) {
      return { success: true, applications: [] };
    }
    query = query.in("job_id", jobIds);
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

  // Log action for employer
  await logAction(employerId, "application_status_updated", { applicationId, status });

  if (data?.employee_id) {
    try {
      const { data: job } = await supabaseAdmin
        .from("jobs")
        .select("title")
        .eq("id", data.job_id)
        .single();

      const { data: candidate } = await supabaseAdmin
        .from("profiles")
        .select("email, full_name")
        .eq("id", data.employee_id)
        .single();

      const candidateName = candidate?.full_name || "User";
      const jobTitle = job?.title || "Job Listing";

      // Log action for candidate so real-time notification feed displays it immediately
      await logAction(data.employee_id, "application_status_updated", { 
        applicationId, 
        status, 
        jobTitle, 
        employerId 
      });

      // Send automated message in chat for accepted or rejected status
      if (status === "accepted" || status === "rejected") {
        const chatRes = await createChat(data.employee_id, employerId, data.document_id);
        if (chatRes.success && chatRes.chat) {
          const autoChatMessage = status === "accepted"
            ? `Hi ${candidateName}, your application was received successfully and has been accepted.`
            : `Hi ${candidateName}, your application was reviewed and has been rejected.`;
          await sendMessage(chatRes.chat.id, employerId, autoChatMessage);
        }
      }

      // Trigger Novu notification to candidate
      sendApplicationStatusUpdatedNotification(
        data.employee_id,
        candidate?.email,
        jobTitle,
        status
      ).catch((err) => console.error("Novu notification error:", err));

    } catch (notifyErr) {
      console.error("Failed to notify applicant or send automated chat message:", notifyErr);
    }
  }

  // Automatic Job Closing / Re-opening based on employees_needed limit
  if (data?.job_id) {
    try {
      const { data: job } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("id", data.job_id)
        .single();

      if (job) {
        const positionsNeeded = Number(job.employees_needed || job.positions_needed || 1);

        const { count: acceptedCount } = await supabaseAdmin
          .from("job_applications")
          .select("id", { count: "exact", head: true })
          .eq("job_id", data.job_id)
          .eq("status", "accepted");

        const accepted = acceptedCount || 0;

        if (accepted >= positionsNeeded && job.status !== "closed" && job.status !== "filled") {
          await supabaseAdmin
            .from("jobs")
            .update({ status: "closed" })
            .eq("id", data.job_id);

          await logAction(employerId, "job_auto_closed", { jobId: data.job_id, accepted, positionsNeeded });
        } else if (accepted < positionsNeeded && (job.status === "closed" || job.status === "filled")) {
          await supabaseAdmin
            .from("jobs")
            .update({ status: "open" })
            .eq("id", data.job_id);

          await logAction(employerId, "job_auto_reopened", { jobId: data.job_id, accepted, positionsNeeded });
        }
      }
    } catch (autoErr) {
      console.error("Error during automatic job status check:", autoErr);
    }
  }

  return { success: true, application: data };
}

export async function retractApplication(applicationId: string, employeeId: string) {
  // Verify ownership before deleting
  const { data: app, error: fetchError } = await supabaseAdmin
    .from("job_applications")
    .select("id, employee_id, job_id, status")
    .eq("id", applicationId)
    .eq("employee_id", employeeId)
    .single();

  if (fetchError || !app) {
    return { success: false, error: "Application not found or unauthorized." };
  }

  // Don't allow retraction of accepted applications
  if (app.status === "accepted") {
    return { success: false, error: "You cannot retract an application that has already been accepted." };
  }

  const { error } = await supabaseAdmin
    .from("job_applications")
    .delete()
    .eq("id", applicationId)
    .eq("employee_id", employeeId);

  if (error) {
    console.error("Error retracting application:", error);
    return { success: false, error: error.message };
  }

  await logAction(employeeId, "application_retracted", { applicationId, jobId: app.job_id });

  return { success: true };
}
