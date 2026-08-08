"use client";

import { useEffect, useState, type FormEvent } from "react";
import { readApiJson } from "@/lib/admin/api";
import type { AdminBlogPost } from "@/lib/admin/cms-types";
import {
  BLOG_CATEGORIES,
  slugifyBlogTitle,
  type BlogCategorySlug,
} from "@/lib/blog/categories";

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  category: BLOG_CATEGORIES[0].slug as BlogCategorySlug,
  body: "",
  status: "draft" as AdminBlogPost["status"],
  publishedAt: new Date().toISOString().slice(0, 10),
  primaryCtaLabel: "Book a session",
  primaryCtaHref: "/book",
  secondaryCtaLabel: "Browse services",
  secondaryCtaHref: "/services",
  sortOrder: 0,
};

export function AdminBlogPanel() {
  const [posts, setPosts] = useState<AdminBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/blog");
      const data = await readApiJson<{ posts?: AdminBlogPost[]; error?: string }>(response);
      if (!response.ok) throw new Error(data.error || "Could not load blog posts.");
      setPosts(data.posts || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load blog posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startCreate() {
    setEditingId(null);
    setSlugTouched(false);
    setForm({ ...emptyForm, publishedAt: new Date().toISOString().slice(0, 10) });
  }

  function startEdit(post: AdminBlogPost) {
    setEditingId(post.id);
    setSlugTouched(true);
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      category: post.category as BlogCategorySlug,
      body: post.body,
      status: post.status,
      publishedAt: post.publishedAt,
      primaryCtaLabel: post.primaryCtaLabel,
      primaryCtaHref: post.primaryCtaHref,
      secondaryCtaLabel: post.secondaryCtaLabel,
      secondaryCtaHref: post.secondaryCtaHref,
      sortOrder: post.sortOrder,
    });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        slug: form.slug.trim() || slugifyBlogTitle(form.title),
      };
      const response = await fetch(editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await readApiJson<{ post?: AdminBlogPost; error?: string }>(response);
      if (!response.ok) throw new Error(data.error || "Could not save post.");
      await load();
      startCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save post.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      const data = await readApiJson<{ error?: string }>(response);
      if (!response.ok) throw new Error(data.error || "Could not delete post.");
      if (editingId === id) startCreate();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete post.");
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-foreground md:text-4xl">Blog</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Write educational guides by category. Published posts appear on the public Blog page as
          titles under each category; guests open a post to read the full article.
        </p>
      </div>

      {error ? (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="space-y-4 border border-border bg-surface-elevated p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-foreground">
            {editingId ? "Edit post" : "New post"}
          </h2>
          {editingId ? (
            <button
              type="button"
              onClick={startCreate}
              className="text-sm text-muted transition hover:text-accent"
            >
              Cancel edit
            </button>
          ) : null}
        </div>

        <label className="block text-sm">
          <span className="text-muted">Title</span>
          <input
            required
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((current) => ({
                ...current,
                title,
                slug: slugTouched ? current.slug : slugifyBlogTitle(title),
              }));
            }}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted">URL slug</span>
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((current) => ({ ...current, slug: e.target.value }));
            }}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5 font-mono text-sm"
          />
        </label>

        <label className="block text-sm">
          <span className="text-muted">Short description (SEO / intro)</span>
          <textarea
            required
            rows={2}
            value={form.description}
            onChange={(e) => setForm((current) => ({ ...current, description: e.target.value }))}
            className="mt-1 w-full border border-border bg-background px-3 py-2.5"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="text-muted">Category</span>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  category: e.target.value as BlogCategorySlug,
                }))
              }
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            >
              {BLOG_CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Status</span>
            <select
              value={form.status}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  status: e.target.value as AdminBlogPost["status"],
                }))
              }
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="text-muted">Publish date</span>
            <input
              type="date"
              required
              value={form.publishedAt}
              onChange={(e) => setForm((current) => ({ ...current, publishedAt: e.target.value }))}
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-muted">Article body</span>
          <p className="mt-1 text-xs text-muted">
            Write educational paragraphs. Separate paragraphs with a blank line.
          </p>
          <textarea
            required
            rows={14}
            value={form.body}
            onChange={(e) => setForm((current) => ({ ...current, body: e.target.value }))}
            className="mt-2 w-full border border-border bg-background px-3 py-2.5 leading-relaxed"
            placeholder="First paragraph…

Second paragraph…"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Primary CTA label</span>
            <input
              value={form.primaryCtaLabel}
              onChange={(e) => setForm((current) => ({ ...current, primaryCtaLabel: e.target.value }))}
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Primary CTA link</span>
            <input
              value={form.primaryCtaHref}
              onChange={(e) => setForm((current) => ({ ...current, primaryCtaHref: e.target.value }))}
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Secondary CTA label</span>
            <input
              value={form.secondaryCtaLabel}
              onChange={(e) =>
                setForm((current) => ({ ...current, secondaryCtaLabel: e.target.value }))
              }
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">Secondary CTA link</span>
            <input
              value={form.secondaryCtaHref}
              onChange={(e) =>
                setForm((current) => ({ ...current, secondaryCtaHref: e.target.value }))
              }
              className="mt-1 w-full border border-border bg-background px-3 py-2.5"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : editingId ? "Update post" : "Publish / save post"}
        </button>
      </form>

      <div>
        <h2 className="font-display text-2xl text-foreground">All posts</h2>
        {loading ? (
          <p className="mt-4 text-sm text-muted">Loading…</p>
        ) : posts.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No CMS posts yet. Run the blog SQL migration, or create your first article above.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border border-border bg-surface-elevated">
            {posts.map((post) => {
              const category =
                BLOG_CATEGORIES.find((item) => item.slug === post.category)?.name ?? post.category;
              return (
                <li key={post.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{post.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {category} · {post.status} · {post.publishedAt} · /blog/{post.slug}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      className="rounded-sm border border-border px-3 py-1.5 text-sm transition hover:border-accent hover:text-accent"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void onDelete(post.id, post.title)}
                      className="rounded-sm border border-border px-3 py-1.5 text-sm text-muted transition hover:border-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
