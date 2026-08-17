import { chatSystemPreamble } from "@/content/chat-knowledge";
import {
  catalogServices,
  getServicePriceTiers,
  productPriceLabel,
  type CatalogService,
} from "@/content/services";
import { DURATION_TIER_LABELS } from "@/lib/catalog/prices";
import { getServicePath } from "@/lib/catalog/service-paths";
import {
  buildSiteIndex,
  formatDocsForPrompt,
  retrieveSiteDocs,
  type SiteDoc,
} from "@/lib/chat/site-index";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatReply = {
  reply: string;
  suggestTicket?: boolean;
  links?: { label: string; href: string }[];
};

const SERVICE_ALIASES: { slug: string; phrases: string[] }[] = [
  { slug: "tantric", phrases: ["tantric", "tantra"] },
  { slug: "nuru", phrases: ["nuru"] },
  { slug: "body-to-body", phrases: ["body to body", "body-to-body", "btb"] },
  { slug: "yoni", phrases: ["yoni"] },
  { slug: "lingam", phrases: ["lingam"] },
  {
    slug: "couples-sensual",
    phrases: ["couples sensual", "couples tantric", "sensual couples"],
  },
  { slug: "couples", phrases: ["couples massage", "couple massage"] },
  { slug: "swedish", phrases: ["swedish"] },
  { slug: "thai", phrases: ["thai massage", " thai "] },
  { slug: "deep-tissue", phrases: ["deep tissue", "deeptissue"] },
  { slug: "aromatherapy", phrases: ["aromatherapy", "aroma"] },
  { slug: "hot-oil", phrases: ["hot oil"] },
  { slug: "four-hands", phrases: ["four hands", "four-hands", "4 hands"] },
  { slug: "sports", phrases: ["sports massage", "sport massage"] },
  { slug: "prenatal", phrases: ["prenatal", "pregnancy"] },
  { slug: "foot-reflexology", phrases: ["foot reflexology", "reflexology"] },
];

function findServiceInMessage(
  message: string,
  catalog: CatalogService[],
): CatalogService | null {
  const lower = ` ${message.toLowerCase()} `;
  const ranked = SERVICE_ALIASES.map((alias) => {
    const hit = alias.phrases.find((phrase) => lower.includes(phrase.toLowerCase()));
    return hit ? { slug: alias.slug, len: hit.length } : null;
  })
    .filter((row): row is { slug: string; len: number } => Boolean(row))
    .sort((a, b) => b.len - a.len);

  for (const row of ranked) {
    const service = catalog.find((item) => item.slug === row.slug && item.bookable);
    if (service) return service;
  }

  // Fallback: match catalog name tokens
  for (const service of catalog) {
    const name = service.name.toLowerCase();
    if (name.length > 4 && message.toLowerCase().includes(name)) return service;
  }
  return null;
}

function isPriceQuestion(message: string) {
  return /\b(how much|price|prices|cost|costs|rate|rates|฿|baht|pricing|expensive|cheap)\b/i.test(
    message,
  );
}

function formatServicePrices(service: CatalogService): ChatReply {
  const tiers = getServicePriceTiers(service);
  const lines = ([60, 90, 120] as const).map(
    (minutes) => `${DURATION_TIER_LABELS[minutes]}: ${productPriceLabel(tiers[minutes])}`,
  );
  return {
    reply: `${service.name} pricing (Chiang Mai, we come to you):\n• ${lines.join("\n• ")}\n\nYou can book card now, card later, or cash on arrival.`,
    suggestTicket: false,
    links: [
      { label: `Book ${service.name}`, href: `/book?service=${service.slug}` },
      { label: "Details", href: getServicePath(service) },
      { label: "Full pricing", href: "/pricing" },
    ],
  };
}

function tryStructuredReply(
  userMessage: string,
  catalog: CatalogService[],
): ChatReply | null {
  const service = findServiceInMessage(userMessage, catalog);
  if (isPriceQuestion(userMessage)) {
    if (service) return formatServicePrices(service);
    return {
      reply:
        "Tell me which treatment you mean (for example Tantric, Nuru, Swedish, or Thai) and I’ll give the 60 / 90 / 120 prices.",
      suggestTicket: false,
      links: [
        { label: "Full pricing", href: "/pricing" },
        { label: "Signature Experiences", href: "/services/signature" },
        { label: "Wellness Massage", href: "/services/wellness" },
      ],
    };
  }
  return null;
}

function linksFromDocs(docs: SiteDoc[], service: CatalogService | null): ChatReply["links"] {
  const links: { label: string; href: string }[] = [];
  if (service) {
    links.push({ label: `Book ${service.name}`, href: `/book?service=${service.slug}` });
    links.push({ label: "Details", href: getServicePath(service) });
  }
  for (const doc of docs) {
    if (links.length >= 3) break;
    if (!doc.url.startsWith("/")) continue;
    if (links.some((link) => link.href === doc.url)) continue;
    if (doc.section === "knowledge" || doc.section === "support") continue;
    links.push({ label: doc.title.slice(0, 40), href: doc.url });
  }
  if (!links.length) {
    links.push({ label: "Book now", href: "/book" });
    links.push({ label: "View services", href: "/services" });
  }
  return links.slice(0, 3);
}

function buildGroundingContext(userMessage: string, docs: SiteDoc[]) {
  return `${chatSystemPreamble}

You have a searchable index of the ENTIRE RoomSpa website (services, prices, FAQ, about, coverage, cities, cancellation, privacy, terms, blog, and booking help).

Rules for intelligence:
- Answer from the retrieved website documents below. Synthesize across multiple docs when needed.
- If the guest asks about price, use exact 60 / 90 / 120 figures from service docs.
- If information is not in the documents, say you are not sure and offer Talk to Live Agent (ticket) or WhatsApp — do not invent policies, availability slots, or medical advice.
- Prefer short, clear answers. Include useful paths like /book?service=… when relevant.
- Never sound like an escort agency.

## Retrieved website documents
${formatDocsForPrompt(docs)}
`;
}

function fallbackFromSite(
  userMessage: string,
  docs: SiteDoc[],
  catalog: CatalogService[],
): ChatReply {
  const structured = tryStructuredReply(userMessage, catalog);
  if (structured) return structured;

  const service = findServiceInMessage(userMessage, catalog);
  const top = docs.slice(0, 3);
  if (!top.length) {
    return {
      reply:
        "I couldn’t find that on the site. You can Talk to Live Agent and we’ll email customer care, or ask on WhatsApp.",
      suggestTicket: true,
      links: [
        { label: "Book now", href: "/book" },
        { label: "FAQ", href: "/faq" },
      ],
    };
  }

  const parts = top.map((doc, index) => {
    const body = doc.text.length > 420 ? `${doc.text.slice(0, 420)}…` : doc.text;
    if (index === 0) return body;
    return `${doc.title}: ${body}`;
  });

  let reply = parts[0];
  if (parts[1]) reply += `\n\n${parts[1]}`;

  if (service && !isPriceQuestion(userMessage)) {
    const tiers = getServicePriceTiers(service);
    reply += `\n\n${service.name} from ${productPriceLabel(tiers[60])} (60 min).`;
  }

  reply +=
    "\n\nNeed a person? Use Talk to Live Agent below — customer care gets an email right away.";

  return {
    reply,
    suggestTicket: true,
    links: linksFromDocs(top, service),
  };
}

async function callOpenAi(
  messages: ChatMessage[],
  grounding: string,
): Promise<ChatReply | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.OPENAI_CHAT_MODEL?.trim() || "gpt-4o-mini";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `${grounding}

Respond ONLY as JSON:
{
  "reply": "string — guest-facing answer grounded in the website documents",
  "suggestTicket": boolean,
  "links": [{"label":"string","href":"/path"}]
}
Max 3 links (relative hrefs starting with /).
Set suggestTicket=true when the guest wants a person, something is missing, or the issue is urgent — invite them to “Talk to our care team”.
For price questions: always list 60 / 90 / 120 from the documents.
Keep the guest-facing reply warm and easy — spa hospitality language, not technical jargon.`,
        },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("[chat] OpenAI error:", response.status, text.slice(0, 400));
    return null;
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ChatReply;
    if (!parsed.reply || typeof parsed.reply !== "string") return null;
    return {
      reply: parsed.reply.trim(),
      suggestTicket: Boolean(parsed.suggestTicket),
      links: Array.isArray(parsed.links)
        ? parsed.links
            .filter(
              (link) =>
                link &&
                typeof link.label === "string" &&
                typeof link.href === "string" &&
                link.href.startsWith("/"),
            )
            .slice(0, 3)
        : undefined,
    };
  } catch {
    return { reply: raw };
  }
}

export async function generateChatReply(
  messages: ChatMessage[],
  catalog: CatalogService[] = catalogServices.filter((s) => s.bookable),
) {
  const lastUser = [...messages].reverse().find((message) => message.role === "user");
  const userText = lastUser?.content?.trim() || "";
  if (!userText) {
    return {
      reply: "Ask me anything about RoomSpa — services, prices, booking, coverage, or policies.",
      suggestTicket: false,
      links: [{ label: "Book now", href: "/book" }],
    };
  }

  const structured = tryStructuredReply(userText, catalog);
  if (structured) return structured;

  const index = buildSiteIndex(catalog);
  const docs = retrieveSiteDocs(userText, index, 14);
  const grounding = buildGroundingContext(userText, docs);
  const llm = await callOpenAi(messages.slice(-12), grounding);
  if (llm) {
    return {
      ...llm,
      suggestTicket: llm.suggestTicket ?? false,
      links: llm.links?.length ? llm.links : linksFromDocs(docs, findServiceInMessage(userText, catalog)),
    };
  }

  return fallbackFromSite(userText, docs, catalog);
}
