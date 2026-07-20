"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendDocumentStatusEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { logAction } from "./audit";

export async function autoVerifyDocument(docId: string, userId: string) {
  try {
    // 1. Fetch document record
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", docId)
      .single();

    if (docError || !doc) {
      console.error("Auto-verify: Document not found:", docError);
      return { success: false, error: "Document not found" };
    }

    // 2. Fetch user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      console.error("Auto-verify: Profile not found:", profileError);
      return { success: false, error: "Profile not found" };
    }

    const fullName = profile.full_name || "";
    const category = doc.category || "Other";
    const docName = doc.name || "";
    const storagePath = doc.storage_path;
    const currentMetadata = doc.metadata || {};

    let verificationStatus: "verified" | "pending" | "rejected" = "pending";
    let verificationReason = "";
    let confidence = 0.0;
    let method = "heuristic";
    let autoVerifyError = "";

    const apiKey = process.env.GEMINI_API_KEY;

    // A. Attempt Gemini API Verification if key is available
    if (apiKey) {
      try {
        // Download document content from Supabase
        const { data: fileData, error: downloadError } = await supabaseAdmin.storage
          .from("documents")
          .download(storagePath);

        if (downloadError || !fileData) {
          throw new Error(`Failed to download storage file: ${downloadError?.message}`);
        }

        const mimeType = currentMetadata.type || fileData.type || "application/pdf";
        
        // Gemini supports PDF, images
        const supportedTypes = [
          "application/pdf",
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/heic",
          "image/heif"
        ];

        if (supportedTypes.includes(mimeType)) {
          const buffer = Buffer.from(await fileData.arrayBuffer());
          const base64Data = buffer.toString("base64");

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        inlineData: {
                          mimeType: mimeType,
                          data: base64Data
                        }
                      },
                      {
                        text: `You are an automated credential verification AI for CVVault.
Your task is to verify if the attached document matches the user's profile and appears to be a authentic document of the specified category.

User profile name: "${fullName}"
Document category: "${category}"
Document name: "${docName}"

Analyze the document contents and layout:
1. Verify if the document belongs to "${fullName}" (look for name matches, initials, or partial name variations).
2. Verify if the document matches the category "${category}" (e.g. CV/Resume, Certificate, ID).
3. Look for signs of authenticity (logos, dates, issuers) vs suspicious elements.

Return your response strictly in the following JSON format:
{
  "verified": boolean,
  "confidence": number, // float between 0 and 1
  "reason": "Clear explanation of why it was verified, flagged, or rejected"
}`
                      }
                    ]
                  }
                ],
                generationConfig: {
                  responseMimeType: "application/json"
                }
              })
            }
          );

          if (response.ok) {
            const resultJson = await response.json();
            const aiText = resultJson.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (aiText) {
              const aiResult = JSON.parse(aiText.trim());
              confidence = aiResult.confidence ?? 0.0;
              verificationReason = aiResult.reason || "";
              method = "gemini-ai";

              if (aiResult.verified && confidence >= 0.8) {
                verificationStatus = "verified";
              } else if (confidence < 0.3) {
                // Extremely low confidence or highly suspicious
                verificationStatus = "pending"; // Keep pending but flag
              } else {
                verificationStatus = "pending";
              }
            } else {
              autoVerifyError = "Gemini API returned an empty or malformed candidate response.";
            }
          } else {
            const errorText = await response.text();
            console.warn("Gemini API request failed with status:", response.status, errorText);
            autoVerifyError = `Gemini API request failed (${response.status}): ${errorText}`;
          }
        } else {
          autoVerifyError = `Unsupported document MIME type for Gemini: ${mimeType}`;
        }
      } catch (err: any) {
        console.error("Gemini auto-verification error, falling back to heuristics:", err.message);
        autoVerifyError = `Exception during Gemini verification: ${err.message}`;
      }
    } else {
      autoVerifyError = "GEMINI_API_KEY environment variable is not defined.";
    }

    // B. Heuristic Fallback
    if (verificationStatus === "pending" && method === "heuristic") {
      const nameParts = fullName.toLowerCase().split(/\s+/).filter(part => part.length > 2);
      const docNameLower = docName.toLowerCase();
      
      const containsName = nameParts.some(part => docNameLower.includes(part));
      
      if (category.toLowerCase() === "resume" || category.toLowerCase() === "cv") {
        // Resumes are lower risk, auto-verify if name matches or matches keywords
        if (containsName || docNameLower.includes("cv") || docNameLower.includes("resume")) {
          verificationStatus = "verified";
          verificationReason = "Auto-verified: Low-risk CV/Resume document type.";
          confidence = 0.9;
        } else {
          verificationReason = "Pending: Document name does not reference user name or CV keywords.";
          confidence = 0.5;
        }
      } else {
        // Certificates and other categories require manual audit by default if AI is not available
        verificationReason = "Pending: Certificate or high-risk category queued for manual verification.";
        confidence = 0.6;
      }
    }

    // 3. Update document metadata
    const updatedMetadata = {
      ...currentMetadata,
      verification_status: verificationStatus,
      auto_verified: true,
      auto_verified_method: method,
      auto_verified_confidence: confidence,
      auto_verified_reason: verificationReason,
      auto_verified_at: new Date().toISOString(),
      auto_verification_error: autoVerifyError || undefined
    };

    const { error: updateError } = await supabaseAdmin
      .from("documents")
      .update({ metadata: updatedMetadata })
      .eq("id", docId);

    if (updateError) {
      console.error("Auto-verify: Error updating document metadata:", updateError);
      return { success: false, error: updateError.message };
    }

    // 4. Send email if status is verified/rejected
    if (verificationStatus === "verified" && profile.email) {
      sendDocumentStatusEmail(
        profile.email,
        docName,
        verificationStatus,
        fullName
      ).catch(err => console.error("Failed to trigger email notification:", err));
    }

    await logAction(userId, "DOCUMENT_AUTO_VERIFY", {
      docId,
      status: verificationStatus,
      method,
      confidence
    });

    revalidatePath("/dashboard/documents");
    revalidatePath("/admin");

    return {
      success: true,
      status: verificationStatus,
      reason: verificationReason,
      confidence,
      method
    };
  } catch (error: any) {
    console.error("Error in autoVerifyDocument action:", error);
    return { success: false, error: error.message };
  }
}
