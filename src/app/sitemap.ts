import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "@/content/blog";
import { cities } from "@/content/cities";
import { catalogServices } from "@/content/services";
import { site } from "@/content/site";
import { getServiceLocationParams } from "@/lib/seo/locations";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/services",
    "/pricing",
    "/about",
    "/book",
    "/coverage",
    "/city",
    "/reviews",
    "/faq",
    "/contact",
    "/blog",
    "/my-booking",
    "/privacy",
    "/terms",
    "/cancellation",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/book" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route === "/book" || route === "/services" ? 0.9 : 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = catalogServices
    .filter((service) => service.bookable)
    .map((service) => ({
      url: `${base}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  const serviceLocationRoutes: MetadataRoute.Sitemap = getServiceLocationParams().map(
    ({ slug, location }) => ({
      url: `${base}/services/${slug}/${location}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }),
  );

  const cityRoutes: MetadataRoute.Sitemap = cities.flatMap((city) => [
    {
      url: `${base}/city/${city.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: city.status === "active" ? 0.85 : 0.5,
    },
    ...city.neighborhoods.map((area) => ({
      url: `${base}/city/${city.slug}/${area.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: city.status === "active" ? 0.8 : 0.4,
    })),
  ]);

  const blogRoutes: MetadataRoute.Sitemap = getAllBlogPosts().map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.datePublished),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    ...staticRoutes,
    ...serviceRoutes,
    ...serviceLocationRoutes,
    ...cityRoutes,
    ...blogRoutes,
  ];
}
