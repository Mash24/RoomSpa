/** Discreet threshold between main site and Signature Experiences. */
export function SignatureIntro({ className = "" }: { className?: string }) {
  return (
    <section
      className={`relative overflow-hidden border-y border-[#c9a86c]/20 bg-[#0c0a09] px-4 py-16 xs:px-5 md:px-8 md:py-24 ${className}`}
      aria-label="RoomSpa Signature"
    >
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-soft-light"
        style={{ backgroundImage: "var(--grain)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0c0a09] to-transparent"
        aria-hidden
      />
      <div className="relative mx-auto max-w-3xl text-center">
        <p className="animate-fade-up text-[0.62rem] font-medium uppercase tracking-[0.5em] text-[#c9a86c] xs:text-[0.7rem]">
          RoomSpa Signature
        </p>
        <p className="animate-fade-up delay-1 mx-auto mt-6 max-w-lg font-display text-[1.35rem] leading-snug tracking-tight text-[#f5f0e8] xs:text-2xl md:text-[1.75rem] md:leading-relaxed">
          For those looking for something beyond the traditional massage.
        </p>
        <div
          className="animate-fade-up delay-2 mx-auto mt-10 h-px w-20 bg-gradient-to-r from-transparent via-[#c9a86c]/50 to-transparent"
          aria-hidden
        />
        <p className="animate-fade-up delay-3 mx-auto mt-8 max-w-sm text-sm leading-relaxed text-[#f5f0e8]/55">
          Private · Consent-led · Discreet arrival · Your hotel, condo, or home
        </p>
      </div>
    </section>
  );
}
