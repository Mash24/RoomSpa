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

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as Partial<AdminBlogPost>;
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.title != null) patch.title = String(body.title).trim();
  if (body.description != null) patch.description = String(body.description).trim();
  if (body.body != null) patch.body = String(body.body).trim();
  if (body.publishedAt != null) patch.published_at = String(body.publishedAt).slice(0, 10);
  if (body.sortOrder != null) patch.sort_order = Number(body.sortOrder);
  if (body.primaryCtaLabel != null) patch.primary_cta_label = String(body.primaryCtaLabel).trim() || null;
  if (body.primaryCtaHref != null) patch.primary_cta_href = String(body.primaryCtaHref).trim() || null;
  if (body.secondaryCtaLabel != null) {
    patch.secondary_cta_label = String(body.secondaryCtaLabel).trim() || null;
  }
  if (body.secondaryCtaHref != null) patch.secondary_cta_href = String(body.secondaryCtaHref).trim() || null;

  if (body.category != null) {
    if (!isBlogCategorySlug(body.category)) {
      return NextResponse.json({ error: "Choose a valid category." }, { status: 400 });
    }
    patch.category = body.category;
  }

  if (body.status != null) {
    if (!["draft", "published", "hidden"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }
    patch.status = body.status;
  }

  if (body.slug != null) {
    const slug = String(body.slug).trim().toLowerCase() || slugifyBlogTitle(String(body.title ?? ""));
    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }
    patch.slug = slug;
  }

  if (body.title != null && !String(body.title).trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }
  if (body.body != null && !String(body.body).trim()) {
    return NextResponse.json({ error: "Article body is required." }, { status: 400 });
  }

  const { data, error: dbError } = await supabase
    .from("blog_posts")
    .update(patch)
    .eq("id", id)
    .select(
      "id, slug, title, description, category, body, status, published_at, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, sort_order",
    )
    .single();

  if (dbError) {
    const message = /duplicate|unique/i.test(dbError.message)
      ? "That URL slug is already used."
      : dbError.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ post: mapBlog(data as Record<string, unknown>) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { supabase, error } = await requireAdminSession();
  if (error || !supabase) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { error: dbError } = await supabase.from("blog_posts").delete().eq("id", id);
  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
