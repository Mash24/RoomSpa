import Link from "next/link";
import {
  getServicePriceTiers,
  productPriceLabel,
  type CatalogService,
  type DurationMinutes,
} from "@/content/services";
import { DURATION_TIER_LABELS, DURATION_TIERS } from "@/lib/catalog/prices";

type ServicePriceTiersProps = {
  service: CatalogService;
  /** Highlight which duration is selected (booking) */
  selectedMinutes?: DurationMinutes;
  onSelect?: (minutes: DurationMinutes) => void;
  className?: string;
};

export function ServicePriceTiers({
  service,
  selectedMinutes,
  onSelect,
  className = "",
}: ServicePriceTiersProps) {
  const tiers = getServicePriceTiers(service);
  const interactive = Boolean(onSelect);

  return (
    <div
      className={`grid grid-cols-3 gap-2 sm:gap-3 ${className}`}
      role={interactive ? "radiogroup" : undefined}
      aria-label={`${service.name} duration and price`}
    >
      {DURATION_TIERS.map((minutes) => {
        const selected = selectedMinutes === minutes;
        const amount = tiers[minutes];
        const inner = (
          <>
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted sm:text-xs">
              {DURATION_TIER_LABELS[minutes]}
            </p>
            <p className="mt-1.5 font-display text-lg tracking-tight text-accent sm:text-xl md:text-2xl">
              {productPriceLabel(amount)}
            </p>
          </>
        );

        if (interactive) {
          return (
            <button
              key={minutes}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect?.(minutes)}
              className={`rounded-sm border px-2 py-3 text-left transition sm:px-3 sm:py-4 ${
                selected
                  ? "border-accent bg-accent-soft/40"
                  : "border-border bg-surface-elevated hover:border-accent/50"
              }`}
            >
              {inner}
            </button>
          );
        }

        return (
          <div
            key={minutes}
            className="rounded-sm border border-border bg-surface-elevated px-2 py-3 sm:px-3 sm:py-4"
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}

export function ServicePriceTiersCompact({ service }: { service: CatalogService }) {
  const tiers = getServicePriceTiers(service);
  return (
    <p className="text-sm text-muted">
      {DURATION_TIERS.map((minutes, index) => (
        <span key={minutes}>
          {index > 0 ? " · " : ""}
          <span className="text-foreground/80">{DURATION_TIER_LABELS[minutes]}</span>{" "}
          {productPriceLabel(tiers[minutes])}
        </span>
      ))}
    </p>
  );
}

export function ServiceBookLink({
  slug,
  minutes = 60,
}: {
  slug: string;
  minutes?: DurationMinutes;
}) {
  return (
    <Link
      href={`/book?service=${slug}&duration=${minutes}`}
      className="inline-flex rounded-sm bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90"
    >
      Book
    </Link>
  );
}
