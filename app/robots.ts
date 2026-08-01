import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pbti-pet-personality.pages.dev";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/auth/", "/create", "/dashboard", "/login", "/quiz", "/register", "/report/", "/result", "/upload"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
