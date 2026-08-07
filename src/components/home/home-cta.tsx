import Link from "next/link";
import { whatsappHref } from "@/content/site";

export function HomeCta() {
  return (
    <section className="relative overflow-hidden bg-[#1a221c] px-4 py-14 text-white xs:px-5 xs:py-16 md:px-8 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(126,184,164,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(47,93,80,0.45), transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <h2 className="max-w-2xl font-display text-[1.85rem] leading-tight tracking-tight xs:text-4xl md:text-5xl">
          Ready when you are
        </h2>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70 xs:mt-4 xs:text-base md:text-lg">
          Book online or message us on WhatsApp — we reply quickly and come to your hotel, condo, or home.
        </p>
        <div className="mt-7 flex w-full flex-col gap-2.5 xs:mt-8 xs:gap-3 sm:max-w-lg sm:flex-row">
          <Link
            href="/book"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-sm bg-white px-5 py-3.5 text-sm font-medium text-[#1a221c] transition hover:bg-white/90 sm:flex-none sm:px-6"
          >
            Book an appointment
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-sm border border-white/30 px-5 py-3.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10 sm:flex-none sm:px-6"
          >
            WhatsApp us
          </a>
        </div>
      </div>
    </section>
  );
}
