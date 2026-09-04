export default function TherapistsLoading() {
  return (
    <div className="therapist-gallery-shell flex min-h-screen items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3" role="status" aria-live="polite">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-[rgba(200,169,107,0.2)]">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[#C8A96B]/70" />
        </div>
        <p className="text-sm text-[#B8B0A3]">Loading…</p>
      </div>
    </div>
  );
}
