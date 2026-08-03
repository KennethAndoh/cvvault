"use server";

import { parseDocumentMetadata, ParsedDocumentMetadata } from "@/lib/ocr-parser";

export async function runDocumentOcr(
  fileName: string,
  sampleText?: string
): Promise<{ success: boolean; data?: ParsedDocumentMetadata; error?: string }> {
  try {
    const result = parseDocumentMetadata(fileName, sampleText);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error running OCR on document:", error);
    return { success: false, error: "Failed to run OCR parsing" };
  }
}
