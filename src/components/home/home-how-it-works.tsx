import { site } from "@/content/site";

export function HomeHowItWorks() {
  return (
    <section className="bg-surface px-5 py-20 md:px-8 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">How it works</p>
          <h2 className="mt-3 font-display text-4xl tracking-tight text-foreground md:text-5xl">
            Book in three calm steps
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
            No spa commute. No waiting room. Just a clear booking flow and a therapist who comes to you.
          </p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          {site.howItWorks.map((item) => (
            <li key={item.step}>
              <p className="font-display text-4xl text-accent/70">{item.step}</p>
              <h3 className="mt-4 font-display text-2xl tracking-tight text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
