import type { MetadataRoute } from "next";
import { cities } from "@/content/cities";
import { catalogServices } from "@/content/services";
import { site } from "@/content/site";
import { getPublishedBlogPosts } from "@/lib/blog/public";
import { getPublicTherapists } from "@/lib/therapists/public";
import { getServicePath, getServiceLocationPath } from "@/lib/catalog/service-paths";
import { getServiceLocationParams } from "@/lib/seo/locations";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/services",
    "/services/wellness",
    "/services/signature",
    "/therapists",
    "/pricing",
    "/about",
    "/book",
    "/coverage",
    "/city",
    "/reviews",
    "/gallery",
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
      url: `${base}${getServicePath(service)}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

  const serviceLocationRoutes: MetadataRoute.Sitemap = getServiceLocationParams().map(
    ({ slug, location }) => {
      const service = catalogServices.find((s) => s.slug === slug);
      if (!service) return null;
      return {
        url: `${base}${getServiceLocationPath(service, location)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      };
    },
  ).filter(Boolean) as MetadataRoute.Sitemap;

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

  const blogPosts = await getPublishedBlogPosts();
  const therapists = await getPublicTherapists({});
  const therapistRoutes: MetadataRoute.Sitemap = therapists.map((t) => ({
    url: `${base}/therapists/${t.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
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
    ...therapistRoutes,
    ...blogRoutes,
  ];
}
