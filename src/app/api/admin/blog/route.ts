import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/auth";
import type { AdminBlogPost } from "@/lib/admin/cms-types";
import { isBlogCategorySlug, slugifyBlogTitle } from "@/lib/blog/categories";

function mapBlog(row: Record<string, unknown>): AdminBlogPost {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    description: String(row.description ?? ""),
    category: String(row.category),
    body: String(row.body ?? ""),
    status: (row.status as AdminBlogPost["status"]) || "draft",
    publishedAt: String(row.published_at ?? "").slice(0, 10),
    primaryCtaLabel: String(row.primary_cta_label ?? ""),
    primaryCtaHref: String(row.primary_cta_href ?? ""),
    secondaryCtaLabel: String(row.secondary_cta_label ?? ""),
    secondaryCtaHref: String(row.secondary_cta_href ?? ""),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

export async function GET() {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error: dbError } = await supabase
    .from("blog_posts")
    .select(
      "id, slug, title, description, category, body, status, published_at, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, sort_order",
    )
    .order("published_at", { ascending: false })
    .order("sort_order", { ascending: true });

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({
    posts: (data ?? []).map((row) => mapBlog(row as Record<string, unknown>)),
  });
}

export async function POST(request: Request) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as Partial<AdminBlogPost> & { title?: string };
  if (!body?.title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (!body.category || !isBlogCategorySlug(body.category)) {
    return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
  }
  if (!body.body?.trim()) {
    return NextResponse.json({ error: "Article body is required." }, { status: 400 });
  }

  const slug = (body.slug?.trim() || slugifyBlogTitle(body.title)).toLowerCase();
  if (!slug) {
    return NextResponse.json({ error: "Could not build a URL slug from the title." }, { status: 400 });
  }

  const status = body.status === "published" || body.status === "hidden" ? body.status : "draft";
  const publishedAt = body.publishedAt?.trim() || new Date().toISOString().slice(0, 10);

  const { data, error: dbError } = await supabase
    .from("blog_posts")
    .insert({
      slug,
      title: body.title.trim(),
      description: (body.description ?? "").trim(),
      category: body.category,
      body: body.body.trim(),
      status,
      published_at: publishedAt,
      primary_cta_label: body.primaryCtaLabel?.trim() || null,
      primary_cta_href: body.primaryCtaHref?.trim() || null,
      secondary_cta_label: body.secondaryCtaLabel?.trim() || null,
      secondary_cta_href: body.secondaryCtaHref?.trim() || null,
      sort_order: Number(body.sortOrder ?? 0),
      updated_at: new Date().toISOString(),
    })
    .select(
      "id, slug, title, description, category, body, status, published_at, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, sort_order",
    )
    .single();

  if (dbError) {
    const message = /duplicate|unique/i.test(dbError.message)
      ? "That URL slug is already used. Change the slug or title."
      : dbError.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ post: mapBlog(data as Record<string, unknown>) });
}
