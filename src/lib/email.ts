import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendDocumentStatusEmail(
  to: string,
  documentName: string,
  status: 'verified' | 'rejected',
  userName?: string
) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Email notification skipped.");
    return { success: false, error: "RESEND_API_KEY is not set." };
  }

  const subject = status === 'verified' 
    ? `Document Verified: ${documentName}` 
    : `Document Rejected: ${documentName}`;

  const greeting = userName ? `Hello ${userName},` : 'Hello,';
  
  const statusMessage = status === 'verified'
    ? `Great news! Your document "<strong>${documentName}</strong>" has been verified and approved by our team.`
    : `Unfortunately, your document "<strong>${documentName}</strong>" has been rejected. Please review our guidelines and upload a valid document.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>CVVault Document Update</h2>
      <p>${greeting}</p>
      <p>${statusMessage}</p>
      <p>Log in to your CVVault dashboard to see more details.</p>
      <br />
      <p>Best regards,<br/>The CVVault Team</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: 'CVVault <onboarding@resend.dev>', // Use onboarding@resend.dev for testing if domain isn't verified
      to: [to],
      subject,
      html,
    });

    if (error) {
      console.error("Failed to send email via Resend:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Error sending document status email:", error);
    return { success: false, error: error.message };
  }
}
