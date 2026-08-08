import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { BlogPostingJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { getAllBlogPosts, getBlogPost } from "@/content/blog";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return buildPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const related = getAllBlogPosts()
    .filter((item) => item.slug !== post.slug)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <BlogPostingJsonLd
        title={post.title}
        description={post.description}
        slug={post.slug}
        datePublished={post.datePublished}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
      />

      <p className="mt-8 text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {post.datePublished} · {post.tags.join(" · ")}
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        {post.title}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{post.description}</p>

      <div className="mt-10 space-y-5 text-base leading-relaxed text-foreground/90 md:text-lg">
        {post.body.map((paragraph) => (
          <p key={paragraph.slice(0, 48)}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-8">
        <Link
          href={post.primaryCta?.href ?? "/book"}
          className="inline-flex rounded-sm bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
        >
          {post.primaryCta?.label ?? "Book a session"}
        </Link>
        <Link
          href={post.secondaryCta?.href ?? "/services"}
          className="inline-flex rounded-sm border border-border px-5 py-3 text-sm transition hover:border-accent hover:text-accent"
        >
          {post.secondaryCta?.label ?? "Browse services"}
        </Link>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-display text-2xl text-foreground">More guides</h2>
          <ul className="mt-4 space-y-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link href={`/blog/${item.slug}`} className="text-accent underline">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
