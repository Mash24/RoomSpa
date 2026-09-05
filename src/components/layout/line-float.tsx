import { lineHref } from "@/content/site";

function LineMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.5C6.75 2.5 2.5 6.36 2.5 11.1c0 4.22 3.75 7.76 8.81 8.42.34.07.81.22.93.51.11.27.07.7 0 1l-.32 1.86c-.09.52-.47 2.04 1.79 1.12C16.97 22.1 21.5 15.85 21.5 11.1 21.5 6.36 17.25 2.5 12 2.5Zm-3.2 11.55H7.28a.47.47 0 0 1-.47-.47V8.92c0-.26.21-.47.47-.47s.47.21.47.47v4.19h1.52c.26 0 .47.21.47.47s-.21.47-.47.47Zm2.21-.47a.47.47 0 0 1-.94 0V8.92c0-.26.21-.47.47-.47s.47.21.47.47v4.66Zm3.79.47h-2.5a.47.47 0 0 1-.47-.47V8.92c0-.26.21-.47.47-.47s.47.21.47.47v4.19h2.03c.26 0 .47.21.47.47s-.21.47-.47.47Zm4.1-1.18-1.55-2.08a.47.47 0 0 1-.1-.29V8.92c0-.26.21-.47.47-.47s.47.21.47.47v1.28l1.55 2.08a.47.47 0 0 1-.38.76h-.02a.47.47 0 0 1-.38-.21l-.06-.16Z" />
    </svg>
  );
}

export function LineFloat() {
  return (
    <a
      href={lineHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on LINE"
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#06C755] text-white shadow-lg shadow-black/20 transition hover:scale-[1.03] hover:bg-[#05b34c] sm:h-auto sm:w-auto sm:gap-2 sm:px-4 sm:py-3"
    >
      <LineMark className="h-5 w-5 shrink-0" />
      <span className="hidden text-sm font-medium sm:inline">LINE</span>
    </a>
  );
}
