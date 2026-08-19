import fs from "fs/promises";
import path from "path";

export const alt = "Pryvault | Secure Career Credentials";
export const contentType = "image/png";

export default async function Image() {
  try {
    const logoFilePath = path.join(process.cwd(), "public", "logo.png");
    const buffer = await fs.readFile(logoFilePath);
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating OG image from logo:", error);
    return new Response(null, { status: 500 });
  }
}
