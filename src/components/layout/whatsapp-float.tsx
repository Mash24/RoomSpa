import { whatsappHref } from "@/content/site";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-[1.03] hover:bg-[#20bd5b] sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-3"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor" aria-hidden>
        <path d="M19.05 4.91A9.82 9.82 0 0 0 12.03 2C6.56 2 2.1 6.46 2.1 11.93c0 1.75.46 3.45 1.32 4.95L2 22l5.27-1.38a9.9 9.9 0 0 0 4.76 1.21h.01c5.47 0 9.93-4.46 9.93-9.93a9.84 9.84 0 0 0-2.92-6.99Zm-7.01 15.24h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.2 8.2 0 0 1-1.26-4.35c0-4.53 3.69-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.41a8.17 8.17 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23Zm4.51-6.17c-.25-.13-1.47-.72-1.7-.8-.23-.08-.39-.13-.56.12-.16.25-.64.8-.78.96-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.26-.74-.66-1.24-1.48-1.39-1.73-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.85-.2-.48-.4-.41-.56-.42h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.41 1.01 2.58c.12.16 1.75 2.68 4.24 3.75.59.26 1.06.42 1.42.53.6.19 1.15.16 1.59.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29Z" />
      </svg>
      <span className="hidden text-sm font-medium sm:inline">WhatsApp</span>
    </a>
  );
}
