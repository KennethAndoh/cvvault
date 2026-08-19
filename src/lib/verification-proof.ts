import crypto from "crypto";

const APP_SECRET = process.env.VERIFICATION_SECRET || "pryvault_secure_verification_secret_key_2026";

export interface DocumentProofData {
  documentId: string;
  userId: string;
  storagePath: string;
  createdAt: string;
  verificationStatus: string;
  docName: string;
}

/**
 * Generates an HMAC-SHA256 cryptographic digest proof for a document credential.
 */
export function generateDocumentProofToken(data: DocumentProofData): string {
  const payload = `${data.documentId}:${data.userId}:${data.createdAt}:${data.verificationStatus}:${data.storagePath}`;
  return crypto
    .createHmac("sha256", APP_SECRET)
    .update(payload)
    .digest("hex");
}

/**
 * Verifies if the provided proof token matches the document data digest.
 */
export function verifyDocumentProofToken(data: DocumentProofData, providedToken: string): boolean {
  if (!providedToken) return false;
  const expectedToken = generateDocumentProofToken(data);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedToken, "hex"),
      Buffer.from(providedToken, "hex")
    );
  } catch {
    return false;
  }
}
