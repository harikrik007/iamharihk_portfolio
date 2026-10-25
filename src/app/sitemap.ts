import type { MetadataRoute } from "next";
import { profile } from "@/lib/content";

// A single page. No lastModified: new Date() would make this route dynamic
// under cacheComponents, and the date would be the build date anyway.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: profile.siteUrl, changeFrequency: "monthly", priority: 1 }];
}
