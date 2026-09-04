export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[40vh] w-full max-w-6xl items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-accent/70" />
        </div>
        <p className="text-sm text-muted">Loading…</p>
      </div>
    </div>
  );
}
