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
  /** Light text / glass borders for dark photo backdrops */
  onDark?: boolean;
};

export function ServicePriceTiers({
  service,
  selectedMinutes,
  onSelect,
  className = "",
  onDark = false,
}: ServicePriceTiersProps) {
  const tiers = getServicePriceTiers(service);
  const interactive = Boolean(onSelect);

  return (
    <div
      className={`grid grid-cols-3 gap-1.5 xs:gap-2 sm:gap-3 ${className}`}
      role={interactive ? "radiogroup" : undefined}
      aria-label={`${service.name} duration and price`}
    >
      {DURATION_TIERS.map((minutes) => {
        const selected = selectedMinutes === minutes;
        const amount = tiers[minutes];
        const inner = (
          <>
            <p
              className={`text-[0.6rem] font-medium uppercase tracking-[0.12em] xs:text-[0.65rem] sm:text-xs ${
                onDark
                  ? "text-white/80 drop-shadow-[0_1px_6px_rgba(0,0,0,0.55)]"
                  : "text-muted"
              }`}
            >
              {DURATION_TIER_LABELS[minutes]}
            </p>
            <p
              className={`mt-1 break-words font-display text-base tracking-tight xs:text-lg sm:mt-1.5 sm:text-xl md:text-2xl ${
                onDark
                  ? "text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]"
                  : "text-accent"
              }`}
            >
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
                  ? onDark
                    ? "border-white/70 bg-white/15"
                    : "border-accent bg-accent-soft/40"
                  : onDark
                    ? "border-white/20 bg-transparent hover:border-white/45"
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
            className={
              onDark
                ? "px-0 py-1 text-left sm:py-1.5"
                : "rounded-sm border border-border bg-surface-elevated px-2 py-3 sm:px-3 sm:py-4"
            }
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
