import { NextResponse } from "next/server";
import { xStatusUrlCandidates } from "@/lib/media/urls";

export const dynamic = "force-dynamic";

type OEmbedResponse = {
  html?: string;
  url?: string;
  author_name?: string;
};

/**
 * Proxy X/Twitter publish oEmbed so the browser can render posts that
 * fail with a plain `/i/status/{id}` blockquote ("Not found").
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url")?.trim();
  if (!raw) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const candidates = xStatusUrlCandidates(raw);
  if (!candidates.length) {
    return NextResponse.json({ error: "Not an X/Twitter status URL." }, { status: 400 });
  }

  for (const candidate of candidates) {
    try {
      const endpoint = new URL("https://publish.twitter.com/oembed");
      endpoint.searchParams.set("url", candidate);
      endpoint.searchParams.set("omit_script", "true");
      endpoint.searchParams.set("dnt", "true");
      endpoint.searchParams.set("hide_thread", "true");
      endpoint.searchParams.set("partner", "");
      endpoint.searchParams.set("lang", "en");

      const res = await fetch(endpoint.toString(), {
        headers: { Accept: "application/json" },
        next: { revalidate: 3600 },
      });
      if (!res.ok) continue;

      const data = (await res.json()) as OEmbedResponse;
      if (!data.html) continue;

      return NextResponse.json({
        html: data.html,
        resolvedUrl: candidate,
        authorName: data.author_name ?? null,
      });
    } catch {
      // try next candidate
    }
  }

  return NextResponse.json(
    { error: "This X post could not be embedded. It may be private, deleted, or restricted." },
    { status: 404 },
  );
}
