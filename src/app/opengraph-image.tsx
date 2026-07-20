export const alt = "CVVault | Secure Career Credentials";
export const contentType = "image/jpeg";

export default async function Image() {
  // Fetch the original logo directly from Supabase storage
  const logoUrl =
    "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/WhatsApp-Image-2025-11-05-at-13.03.39-1770063498606.jpeg";

  try {
    const response = await fetch(logoUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch original logo");
    }
    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Error generating OG image from original logo:", error);
    // Return a blank response fallback
    return new Response(null, { status: 500 });
  }
}
