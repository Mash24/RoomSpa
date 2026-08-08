import { createAdminishAnonClient } from "@/lib/supabase/anon";
import { getAllBlogPosts, type BlogPost } from "@/content/blog";
import {
  getBlogCategory,
  isBlogCategorySlug,
  splitBlogBody,
  type BlogCategorySlug,
} from "@/lib/blog/categories";

export type PublicBlogPost = {
  id?: string;
  slug: string;
  title: string;
  description: string;
  category: BlogCategorySlug;
  categoryName: string;
  datePublished: string;
  body: string[];
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

function mapStatic(post: BlogPost): PublicBlogPost {
  const category = getBlogCategory(post.category);
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    categoryName: category?.name ?? post.category,
    datePublished: post.datePublished,
    body: post.body,
    primaryCta: post.primaryCta,
    secondaryCta: post.secondaryCta,
  };
}

function mapRow(row: Record<string, unknown>): PublicBlogPost | null {
  const categoryRaw = String(row.category ?? "");
  if (!isBlogCategorySlug(categoryRaw)) return null;
  const category = getBlogCategory(categoryRaw);
  const bodyRaw = String(row.body ?? "");
  const primaryLabel = row.primary_cta_label ? String(row.primary_cta_label) : "";
  const primaryHref = row.primary_cta_href ? String(row.primary_cta_href) : "";
  const secondaryLabel = row.secondary_cta_label ? String(row.secondary_cta_label) : "";
  const secondaryHref = row.secondary_cta_href ? String(row.secondary_cta_href) : "";

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description ?? ""),
    category: categoryRaw,
    categoryName: category?.name ?? categoryRaw,
    datePublished: String(row.published_at ?? "").slice(0, 10),
    body: splitBlogBody(bodyRaw),
    primaryCta:
      primaryLabel && primaryHref ? { label: primaryLabel, href: primaryHref } : undefined,
    secondaryCta:
      secondaryLabel && secondaryHref
        ? { label: secondaryLabel, href: secondaryHref }
        : undefined,
  };
}

/** Published posts from CMS, or static guides if the table is empty / not migrated. */
export async function getPublishedBlogPosts(): Promise<PublicBlogPost[]> {
  try {
    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, slug, title, description, category, body, status, published_at, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, sort_order",
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return getAllBlogPosts().map(mapStatic);
    }

    return data.map((row) => mapRow(row as Record<string, unknown>)).filter(Boolean) as PublicBlogPost[];
  } catch {
    return getAllBlogPosts().map(mapStatic);
  }
}

export async function getPublishedBlogPost(slug: string): Promise<PublicBlogPost | null> {
  try {
    const supabase = createAdminishAnonClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select(
        "id, slug, title, description, category, body, status, published_at, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href",
      )
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (!error && data) {
      return mapRow(data as Record<string, unknown>);
    }
  } catch {
    // fall through
  }

  const fallback = getAllBlogPosts().find((post) => post.slug === slug);
  return fallback ? mapStatic(fallback) : null;
}

export async function getPublishedBlogSlugs(): Promise<string[]> {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => post.slug);
}
