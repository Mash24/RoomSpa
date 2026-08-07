import { site } from "@/content/site";

export function HomeHowItWorks() {
  return (
    <section className="bg-surface px-4 py-14 xs:px-5 xs:py-16 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">How it works</p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
            Book in three calm steps
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted xs:mt-4 xs:text-base md:text-lg">
            No spa commute. No waiting room. Just a clear booking flow and a therapist who comes to you.
          </p>
        </div>

        <ol className="mt-10 grid gap-8 xs:mt-12 md:mt-14 md:grid-cols-3 md:gap-8">
          {site.howItWorks.map((item) => (
            <li key={item.step} className="border-t border-border pt-5 md:border-t-0 md:pt-0">
              <p className="font-display text-3xl text-accent/70 xs:text-4xl">{item.step}</p>
              <h3 className="mt-3 font-display text-xl tracking-tight text-foreground xs:mt-4 xs:text-2xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted xs:mt-3 md:text-base">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
