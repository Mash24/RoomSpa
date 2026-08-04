import Link from "next/link";
import { site } from "@/content/site";

export function HomeCta() {
  return (
    <section className="relative overflow-hidden bg-[#1a221c] px-5 py-20 text-white md:px-8 md:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(126,184,164,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(47,93,80,0.45), transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl">
        <h2 className="max-w-2xl font-display text-4xl tracking-tight md:text-5xl">
          Ready when you are
        </h2>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-white/70 md:text-lg">
          {site.coverageNote}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/book"
            className="inline-flex items-center justify-center rounded-sm bg-white px-6 py-3.5 text-sm font-medium text-[#1a221c] transition hover:bg-white/90"
          >
            Book an appointment
          </Link>
          <Link
            href="/coverage"
            className="inline-flex items-center justify-center rounded-sm border border-white/30 px-6 py-3.5 text-sm font-medium text-white transition hover:border-white hover:bg-white/10"
          >
            See coverage areas
          </Link>
        </div>
      </div>
    </section>
  );
}
