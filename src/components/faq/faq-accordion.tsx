"use client";

import { useId, useState } from "react";

export type FaqAccordionItem = {
  question: string;
  answer: string;
};

type Props = {
  items: readonly FaqAccordionItem[];
};

export function FaqAccordion({ items }: Props) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-12 divide-y divide-border border-y border-border">
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div key={item.question}>
            <h2>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:text-accent"
              >
                <span className="font-display text-xl tracking-tight text-foreground md:text-2xl">
                  {item.question}
                </span>
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition ${
                    open ? "rotate-180 border-accent text-accent" : ""
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>
            </h2>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className={open ? "pb-5" : undefined}
            >
              {open ? (
                <p className="max-w-2xl text-sm leading-relaxed text-muted md:text-base">{item.answer}</p>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
