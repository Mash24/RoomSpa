import { chatKnowledge } from "@/content/chat-knowledge";
import { aboutContent, faqItems } from "@/content/pages";
import { coverageAreas } from "@/content/coverage";
import { cities } from "@/content/cities";
import { blogPosts } from "@/content/blog";
import {
  cancellationContent,
  privacyContent,
  termsContent,
} from "@/content/legal";
import { site } from "@/content/site";
import {
  getServiceFaqs,
} from "@/content/service-faqs";
import {
  getServicePriceTiers,
  productPriceLabel,
  serviceCategories,
  type CatalogService,
} from "@/content/services";
import { getExperienceTier } from "@/lib/catalog/experience-tier";
import { getServicePath } from "@/lib/catalog/service-paths";
import { DURATION_TIER_LABELS } from "@/lib/catalog/prices";

export type SiteDoc = {
  id: string;
  title: string;
  url: string;
  section: string;
  text: string;
  tags: string[];
};

function push(
  docs: SiteDoc[],
  doc: Omit<SiteDoc, "tags"> & { tags?: string[] },
) {
  docs.push({
    ...doc,
    tags: doc.tags ?? [],
  });
}

function legalDocs(
  docs: SiteDoc[],
  content: {
    title: string;
    intro: string;
    sections: readonly { heading: string; body: readonly string[] }[];
  },
  url: string,
  section: string,
) {
  push(docs, {
    id: `${section}-intro`,
    title: content.title,
    url,
    section,
    text: content.intro,
    tags: [section, content.title.toLowerCase()],
  });
  for (const item of content.sections) {
    push(docs, {
      id: `${section}-${item.heading.toLowerCase().replace(/\s+/g, "-")}`,
      title: `${content.title}: ${item.heading}`,
      url,
      section,
      text: item.body.join(" "),
      tags: [section, item.heading.toLowerCase()],
    });
  }
}

/** Full-site searchable index for the concierge (services, FAQ, policies, cities, blog, …). */
export function buildSiteIndex(catalog: CatalogService[]): SiteDoc[] {
  const docs: SiteDoc[] = [];

  push(docs, {
    id: "site-overview",
    title: `${site.name} overview`,
    url: "/",
    section: "site",
    text: `${site.name}. ${site.tagline}. ${site.description} Contact: ${site.contact.email}, WhatsApp ${site.contact.whatsapp}. ${site.coverageNote}`,
    tags: ["roomspa", "about", "contact", "whatsapp", "chiang mai"],
  });

  push(docs, {
    id: "site-hero",
    title: "Homepage promise",
    url: "/",
    section: "site",
    text: `${site.hero.headline} ${site.hero.support} CTA: ${site.hero.primaryCta.label}.`,
    tags: ["book", "private", "hotel", "condo", "home"],
  });

  for (const step of site.howItWorks) {
    push(docs, {
      id: `how-${step.step}`,
      title: `How it works: ${step.title}`,
      url: "/",
      section: "how-it-works",
      text: step.body,
      tags: ["booking", "how", "process"],
    });
  }

  for (const category of serviceCategories) {
    const tier = category.id === "sensual" ? "signature" : "wellness";
    const url =
      tier === "signature"
        ? "/services/signature"
        : `/services/wellness#${category.id}`;
    push(docs, {
      id: `category-${category.id}`,
      title: category.title,
      url,
      section: tier === "signature" ? "signature" : "wellness",
      text: category.summary,
      tags: [category.id, tier, "services", category.title.toLowerCase()],
    });
  }

  for (const service of catalog.filter((item) => item.bookable)) {
    const tiers = getServicePriceTiers(service);
    const priceLine = ([60, 90, 120] as const)
      .map((m) => `${DURATION_TIER_LABELS[m]} ${productPriceLabel(tiers[m])}`)
      .join("; ");
    const tier = getExperienceTier(service);
    const tierLabel = tier === "signature" ? "Signature Experience" : "Wellness Massage";

    push(docs, {
      id: `service-${service.slug}`,
      title: service.name,
      url: getServicePath(service),
      section: tier === "signature" ? "signature" : "wellness",
      text: `${service.name} (${tierLabel}). ${service.summary} ${service.details} Duration options: ${service.duration}. Prices: ${priceLine}. Book at /book?service=${service.slug}. Menu: ${tier === "signature" ? "/services/signature" : "/services/wellness"}.`,
      tags: [
        service.slug,
        service.name.toLowerCase(),
        tier,
        service.category,
        "price",
        "massage",
      ],
    });

    for (const faq of getServiceFaqs(service.slug)) {
      push(docs, {
        id: `service-faq-${service.slug}-${faq.question.slice(0, 40)}`,
        title: `${service.name} FAQ: ${faq.question}`,
        url: getServicePath(service),
        section: "service-faq",
        text: `Q: ${faq.question} A: ${faq.answer}`,
        tags: [service.slug, "faq", ...faq.question.toLowerCase().split(/\s+/).slice(0, 6)],
      });
    }
  }

  for (const faq of faqItems) {
    push(docs, {
      id: `faq-${faq.question.slice(0, 48)}`,
      title: faq.question,
      url: "/faq",
      section: "faq",
      text: `Q: ${faq.question} A: ${faq.answer}`,
      tags: ["faq", ...faq.question.toLowerCase().split(/\s+/).slice(0, 8)],
    });
  }

  push(docs, {
    id: "about",
    title: aboutContent.title,
    url: "/about",
    section: "about",
    text: `${aboutContent.lead} ${aboutContent.story.join(" ")} Values: ${aboutContent.values.map((v) => `${v.title}: ${v.body}`).join(" ")}`,
    tags: ["about", "story", "values"],
  });

  legalDocs(docs, privacyContent, "/privacy", "privacy");
  legalDocs(docs, termsContent, "/terms", "terms");
  legalDocs(docs, cancellationContent, "/cancellation", "cancellation");

  for (const area of coverageAreas) {
    push(docs, {
      id: `coverage-${area.slug}`,
      title: `Coverage: ${area.name}`,
      url: "/city/chiang-mai",
      section: "coverage",
      text: `${area.name} in ${area.city}. Travel fee: ${area.travelFeeThb === 0 ? "none in-zone" : `฿${area.travelFeeThb}`}.`,
      tags: ["coverage", area.name.toLowerCase(), area.city.toLowerCase(), "area"],
    });
  }

  for (const city of cities) {
    push(docs, {
      id: `city-${city.slug}`,
      title: `City: ${city.name}`,
      url: `/city/${city.slug}`,
      section: "city",
      text: `${city.headline} Status: ${city.status}. ${city.summary}`,
      tags: ["city", city.name.toLowerCase(), city.status],
    });
    for (const hood of city.neighborhoods) {
      push(docs, {
        id: `hood-${city.slug}-${hood.slug}`,
        title: `${hood.name}, ${city.name}`,
        url: `/city/${city.slug}/${hood.slug}`,
        section: "neighborhood",
        text: `${hood.name} in ${city.name}. ${hood.summary}`,
        tags: ["neighborhood", hood.name.toLowerCase(), city.name.toLowerCase()],
      });
    }
  }

  for (const post of blogPosts) {
    push(docs, {
      id: `blog-${post.slug}`,
      title: post.title,
      url: `/blog/${post.slug}`,
      section: "blog",
      text: `${post.description} ${post.body.join(" ")}`,
      tags: ["blog", ...post.tags.map((t) => t.toLowerCase()), post.category],
    });
  }

  for (const entry of chatKnowledge) {
    push(docs, {
      id: `kb-${entry.id}`,
      title: entry.title,
      url: "/faq",
      section: "knowledge",
      text: entry.content,
      tags: entry.tags,
    });
  }

  push(docs, {
    id: "agent-handoff",
    title: "Talk to Live Agent / customer care",
    url: "/contact",
    section: "support",
    text: "Guests can Talk to Live Agent or Talk to customer care from this chat to open a support ticket. The RoomSpa team is emailed immediately. WhatsApp is also available for fast help.",
    tags: ["agent", "live", "human", "customer care", "support", "ticket", "whatsapp"],
  });

  return docs;
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

/** Rank site documents for a guest question. */
export function retrieveSiteDocs(query: string, docs: SiteDoc[], limit = 12): SiteDoc[] {
  const tokens = tokenize(query);
  if (!tokens.length) return docs.slice(0, limit);

  const queryLower = query.toLowerCase();

  const scored = docs.map((doc) => {
    const hay = `${doc.title} ${doc.tags.join(" ")} ${doc.text} ${doc.url}`.toLowerCase();
    let score = 0;

    for (const token of tokens) {
      if (doc.tags.some((tag) => tag === token || tag.includes(token))) score += 5;
      if (doc.title.toLowerCase().includes(token)) score += 4;
      if (hay.includes(token)) score += 1;
    }

    // Phrase / multi-word boosts
    if (queryLower.length > 8 && hay.includes(queryLower.slice(0, 48))) score += 8;

    // Intent boosts
    if (/\b(price|cost|how much|฿|baht)\b/i.test(query) && /price|฿|baht|pricing/i.test(hay)) {
      score += 6;
    }
    if (/\b(cancel|refund)\b/i.test(query) && doc.section === "cancellation") score += 10;
    if (/\b(privacy|data|personal)\b/i.test(query) && doc.section === "privacy") score += 10;
    if (/\b(terms|legal)\b/i.test(query) && doc.section === "terms") score += 8;
    if (/\b(coverage|nimman|old city|airport|hang dong)\b/i.test(query) && doc.section === "coverage") {
      score += 8;
    }

    return { doc, score };
  });

  return scored
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.doc);
}

export function formatDocsForPrompt(docs: SiteDoc[], maxChars = 12000) {
  const blocks: string[] = [];
  let used = 0;
  for (const doc of docs) {
    const chunk = `[${doc.section}] ${doc.title} (${doc.url})\n${doc.text}`;
    if (used + chunk.length > maxChars) break;
    blocks.push(chunk);
    used += chunk.length + 2;
  }
  return blocks.join("\n\n---\n\n");
}
