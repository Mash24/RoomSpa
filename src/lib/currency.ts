/** Display helpers. Stripe charges in THB. */
export const THB_PER_USD = 36;

export function formatThb(amount: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsdFromThb(amountThb: number) {
  const usd = amountThb / THB_PER_USD;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(usd);
}

/** Guest-facing price label — THB only (no USD conversion clutter). */
export function dualPriceLabel(amountThb: number) {
  return formatThb(amountThb);
}
