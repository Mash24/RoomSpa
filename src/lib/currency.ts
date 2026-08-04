/** Display FX for dual-currency UI. Stripe charges in THB. Update as needed. */
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

export function dualPriceLabel(amountThb: number) {
  return `${formatThb(amountThb)} · ~${formatUsdFromThb(amountThb)}`;
}
