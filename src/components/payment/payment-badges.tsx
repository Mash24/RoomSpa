import { dualPriceLabel } from "@/lib/currency";

type PaymentBadgesProps = {
  compact?: boolean;
};

export function PaymentBadges({ compact = false }: PaymentBadgesProps) {
  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <p className={`text-muted ${compact ? "text-xs" : "text-sm"}`}>
        Cash on arrival accepted · Cards welcome
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-7 items-center rounded-sm border border-border bg-surface-elevated px-2 text-[10px] font-semibold tracking-wider text-foreground">
          VISA
        </span>
        <span className="inline-flex h-7 items-center rounded-sm border border-border bg-surface-elevated px-2 text-[10px] font-semibold tracking-wider text-foreground">
          Mastercard
        </span>
        <span className="inline-flex h-7 items-center rounded-sm border border-border bg-surface-elevated px-2 text-[10px] font-semibold tracking-wider text-foreground">
          AMEX
        </span>
        {!compact ? (
          <span className="text-xs text-muted">Pay now or later — no account needed</span>
        ) : null}
      </div>
    </div>
  );
}

export function formatBookingAmount(amountThb: number) {
  return dualPriceLabel(amountThb);
}
