import { Novu } from "@novu/api";

const novuSecretKey = process.env.NOVU_SECRET_KEY;
let novuInstance: Novu | null = null;

if (novuSecretKey) {
  try {
    novuInstance = new Novu({ secretKey: novuSecretKey });
  } catch (err) {
    console.error("[Novu] Failed to initialize Novu client:", err);
  }
}

export interface NovuTriggerParams {
  workflowId: string;
  subscriberId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  payload?: Record<string, any>;
}

/**
 * Triggers a Novu workflow notification safely without throwing uncaught server errors.
 */
export async function triggerNovuNotification(params: NovuTriggerParams): Promise<{ success: boolean; error?: string }> {
  if (!novuSecretKey || !novuInstance) {
    console.warn(`[Novu] NOVU_SECRET_KEY is not set or client unavailable. Notification '${params.workflowId}' skipped.`);
    return { success: false, error: "NOVU_SECRET_KEY is not set." };
  }

  try {
    await novuInstance.trigger({
      name: params.workflowId,
      to: {
        subscriberId: params.subscriberId,
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
      },
      payload: params.payload || {},
    });

    console.log(`[Novu] Successfully triggered workflow '${params.workflowId}' for subscriber '${params.subscriberId}'`);
    return { success: true };
  } catch (error: any) {
    console.error(`[Novu] Error triggering workflow '${params.workflowId}':`, error?.message || error);
    return { success: false, error: error?.message || "Failed to trigger Novu workflow." };
  }
}

/**
 * Helper to trigger 2FA OTP verification code email.
 */
export async function send2FaOtpNotification(subscriberId: string, email: string, otpCode: string) {
  return triggerNovuNotification({
    workflowId: "2fa-otp-email",
    subscriberId,
    email,
    payload: {
      otp_code: otpCode,
    },
  });
}

/**
 * Helper to trigger document verification status updates (verified or rejected).
 */
export async function sendDocumentStatusNotification(
  subscriberId: string,
  email: string,
  documentName: string,
  status: "verified" | "rejected",
  userName?: string
) {
  return triggerNovuNotification({
    workflowId: "document-status-updated",
    subscriberId,
    email,
    payload: {
      document_name: documentName,
      status,
      user_name: userName || "User",
      message: status === "verified" 
        ? `Your document "${documentName}" has been verified.`
        : `Your document "${documentName}" was rejected. Please upload a clear document.`,
    },
  });
}

/**
 * Helper to trigger job application received notification to the job poster / employer.
 */
export async function sendJobApplicationReceivedNotification(
  employerSubscriberId: string,
  employerEmail: string | undefined,
  jobTitle: string,
  applicantName: string
) {
  return triggerNovuNotification({
    workflowId: "job-application-received",
    subscriberId: employerSubscriberId,
    email: employerEmail,
    payload: {
      job_title: jobTitle,
      applicant_name: applicantName,
      message: `${applicantName} submitted an application for "${jobTitle}".`,
    },
  });
}

/**
 * Helper to trigger job application status update notification to the candidate.
 */
export async function sendApplicationStatusUpdatedNotification(
  applicantSubscriberId: string,
  applicantEmail: string | undefined,
  jobTitle: string,
  newStatus: string
) {
  return triggerNovuNotification({
    workflowId: "application-status-updated",
    subscriberId: applicantSubscriberId,
    email: applicantEmail,
    payload: {
      job_title: jobTitle,
      status: newStatus,
      message: `Your application status for "${jobTitle}" has been updated to ${newStatus}.`,
    },
  });
}
