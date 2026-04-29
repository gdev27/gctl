import type { MetadataRoute } from "next";

const routes = ["/", "/onboarding", "/policies", "/runs", "/swarm", "/evidence", "/settings"];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.SITE_URL || "http://localhost:3000";
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "/" ? "hourly" : "daily",
    priority: route === "/" ? 1 : 0.7
  }));
}
