import type { Metadata } from "next";
import Link from "next/link";
import {
  cancellationContent,
  privacyContent,
  termsContent,
} from "@/content/legal";

type LegalDoc = typeof privacyContent | typeof termsContent | typeof cancellationContent;

function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-20 md:px-8 md:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Legal</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
        {doc.title}
      </h1>
      <p className="mt-2 text-sm text-muted">Last updated {doc.updated}</p>
      <p className="mt-6 text-base leading-relaxed text-muted md:text-lg">{doc.intro}</p>

      <div className="mt-12 space-y-10">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-2xl tracking-tight text-foreground">
              {section.heading}
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted md:text-base">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 text-sm text-muted">
        Back to{" "}
        <Link href="/faq" className="text-accent underline-offset-2 hover:underline">
          FAQ
        </Link>{" "}
        or{" "}
        <Link href="/contact" className="text-accent underline-offset-2 hover:underline">
          Contact
        </Link>
        .
      </p>
    </article>
  );
}

export function PrivacyPageView() {
  return <LegalPage doc={privacyContent} />;
}

export function TermsPageView() {
  return <LegalPage doc={termsContent} />;
}

export function CancellationPageView() {
  return <LegalPage doc={cancellationContent} />;
}

export const privacyMetadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How RoomSpa (GetRoomSpa) collects and uses booking, contact, and payment-related information.",
};

export const termsMetadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for booking and receiving RoomSpa in-room massage in Chiang Mai.",
};

export const cancellationMetadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "How to change or cancel a RoomSpa booking and when refunds apply.",
};
