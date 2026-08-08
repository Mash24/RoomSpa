import { site } from "@/content/site";

export function HomeHowItWorks() {
  return (
    <section className="bg-surface px-4 py-12 xs:px-5 xs:py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">How it works</p>
          <h2 className="mt-3 font-display text-[1.85rem] leading-tight tracking-tight text-foreground xs:text-4xl md:text-5xl">
            Three simple steps
          </h2>
        </div>

        <ol className="mt-8 grid gap-6 md:mt-10 md:grid-cols-3 md:gap-8">
          {site.howItWorks.map((item) => (
            <li key={item.step} className="border-t border-border pt-4 md:border-t-0 md:pt-0">
              <p className="font-display text-2xl text-accent/70 md:text-3xl">{item.step}</p>
              <h3 className="mt-2 font-display text-xl tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
