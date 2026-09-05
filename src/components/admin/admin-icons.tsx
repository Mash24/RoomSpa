import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

export function IconEye({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12s3.75-6.75 9.75-6.75S21.75 12 21.75 12s-3.75 6.75-9.75 6.75S2.25 12 2.25 12Z"
      />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

export function IconEyeOff({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75l16.5 16.5M9.88 9.94A2.75 2.75 0 0 0 14.06 14.1M6.6 6.74C4.3 8.2 2.7 10.4 2.25 12c0 0 3.75 6.75 9.75 6.75 1.7 0 3.2-.4 4.5-1.02M10.4 5.4A10.4 10.4 0 0 1 12 5.25c6 0 9.75 6.75 9.75 6.75a17.4 17.4 0 0 1-2.4 3.05"
      />
    </svg>
  );
}

export function IconPen({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.86 3.86a2.12 2.12 0 0 1 3 3L8.25 18.47 4.5 19.5l1.03-3.75L16.86 3.86Z"
      />
    </svg>
  );
}

export function IconTrash({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 7.5h15M9.75 7.5V5.25A1.5 1.5 0 0 1 11.25 3.75h1.5a1.5 1.5 0 0 1 1.5 1.5V7.5m2.25 0V18a1.5 1.5 0 0 1-1.5 1.5h-7.5A1.5 1.5 0 0 1 6 18V7.5h12Z"
      />
    </svg>
  );
}

export function IconProfile({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a7.5 7.5 0 0 1 15 0"
      />
    </svg>
  );
}

export function IconClose({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className} aria-hidden {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
