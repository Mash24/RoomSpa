import type { ButtonHTMLAttributes, ReactNode } from "react";

export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-[#1a221c] px-4 py-5 text-white shadow-[0_12px_40px_rgba(26,34,28,0.14)] xs:px-6 xs:py-6 md:px-8 md:py-7">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse at 10% 15%, rgba(126,184,164,0.32), transparent 42%), radial-gradient(ellipse at 90% 85%, rgba(47,93,80,0.35), transparent 40%)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/55 xs:text-[0.7rem] xs:tracking-[0.22em]">
            {eyebrow}
          </p>
          <h1 className="mt-2 break-words font-display text-[1.65rem] leading-tight tracking-tight xs:text-[1.85rem] sm:text-4xl md:text-[2.75rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 text-sm leading-relaxed text-white/70 md:text-base">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}

export function AdminFilterPills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  /** @deprecated kept for call-site compat; pills always scroll on small screens */
  columns?: 2 | 3 | 4;
}) {
  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
      <div
        className="inline-flex min-w-full gap-2 sm:min-w-0 sm:flex-wrap sm:rounded-full sm:border sm:border-border sm:bg-surface-elevated sm:p-1"
        role="group"
      >
        {options.map((option) => {
          const active = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition min-h-11 sm:min-h-10 ${
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "border border-border bg-surface-elevated text-foreground hover:border-accent hover:text-accent sm:border-0 sm:bg-transparent sm:hover:bg-accent-soft"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AdminAlert({
  tone = "error",
  children,
}: {
  tone?: "error" | "success" | "warning" | "info";
  children: ReactNode;
}) {
  const tones = {
    error:
      "border-red-300/80 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200",
    success:
      "border-emerald-300/80 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
    warning:
      "border-amber-300/80 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
    info: "border-border bg-accent-soft/50 text-foreground",
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm break-words ${tones[tone]}`}>{children}</div>
  );
}

export function AdminEmpty({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-elevated/80 px-5 py-14 text-center">
      <p className="font-display text-2xl text-foreground">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p> : null}
    </div>
  );
}

export function AdminPrimaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function AdminSecondaryButton({
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface-elevated px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-accent hover:text-accent disabled:opacity-60 ${className}`}
    >
      {children}
    </button>
  );
}

export function adminCardClass(extra = "") {
  return `rounded-2xl border border-border bg-surface-elevated p-5 shadow-[0_1px_0_rgba(15,23,20,0.04)] ${extra}`.trim();
}
