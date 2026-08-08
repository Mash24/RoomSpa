import { dualPriceLabel } from "@/lib/currency";

export const DURATION_TIERS = [60, 90, 120] as const;
export type DurationMinutes = (typeof DURATION_TIERS)[number];

export const DURATION_TIER_LABELS: Record<DurationMinutes, string> = {
  60: "60 min",
  90: "90 min",
  120: "2 hours",
};

type TierSource = {
  amountThb: number;
  durationMinutes?: number;
  priceTiers?: Partial<Record<DurationMinutes, number>>;
};

/** Derive 90 / 120 from a 60-minute base (rounded to ฿50). */
export function buildPriceTiers(base60Thb: number): Record<DurationMinutes, number> {
  const round50 = (n: number) => Math.round(n / 50) * 50;
  const base = Math.max(0, Math.round(base60Thb));
  return {
    60: base,
    90: Math.max(base + 200, round50(base * 1.4)),
    120: Math.max(base + 400, round50(base * 1.75)),
  };
}

export function getServicePriceTiers(service: TierSource): Record<DurationMinutes, number> {
  if (service.priceTiers && Object.keys(service.priceTiers).length > 0) {
    const base = buildPriceTiers(service.amountThb);
    return {
      60: service.priceTiers[60] ?? base[60],
      90: service.priceTiers[90] ?? base[90],
      120: service.priceTiers[120] ?? base[120],
    };
  }

  // Catalog entries priced as 90-min sessions: back into a 60 base.
  if ((service.durationMinutes ?? 60) >= 90) {
    const p90 = service.amountThb;
    const round50 = (n: number) => Math.round(n / 50) * 50;
    const p60 = Math.max(400, round50(p90 / 1.4));
    return {
      60: p60,
      90: p90,
      120: Math.max(p90 + 300, round50(p90 * 1.25)),
    };
  }

  return buildPriceTiers(service.amountThb);
}

export function priceForDuration(
  tiers: Partial<Record<DurationMinutes, number>> | undefined,
  minutes: DurationMinutes,
  fallbackThb = 0,
) {
  const value = tiers?.[minutes];
  return typeof value === "number" && value > 0 ? value : fallbackThb;
}

export function formatDurationLabel(minutes: DurationMinutes) {
  return DURATION_TIER_LABELS[minutes];
}

export function productPriceLabel(amountThb: number) {
  return dualPriceLabel(amountThb);
}
