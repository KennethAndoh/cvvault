import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://cvvault.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/faq", "/privacy", "/p/", "/verify/"],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/api/",
          "/share/",
          "/login",
          "/register",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/faq", "/privacy", "/p/", "/verify/"],
        disallow: ["/dashboard/", "/admin/", "/api/", "/share/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
