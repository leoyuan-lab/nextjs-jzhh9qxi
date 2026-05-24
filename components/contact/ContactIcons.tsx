import type { ReactNode } from 'react';

type IconProps = {
  className?: string;
};

function SvgRoot({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ContactIconInquiry(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z" />
      <path d="M8 9h8M8 13h5" />
    </SvgRoot>
  );
}

export function ContactIconMail(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </SvgRoot>
  );
}

export function ContactIconSupport(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </SvgRoot>
  );
}
