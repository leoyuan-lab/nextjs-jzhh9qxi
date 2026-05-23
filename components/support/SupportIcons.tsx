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

export function SupportIconManual(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <path d="M6 4h9l3 3v13H6V4z" />
      <path d="M15 4v4h4" />
      <path d="M9 12h6M9 16h4" />
    </SvgRoot>
  );
}

export function SupportIconDistributor(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
    </SvgRoot>
  );
}

export function SupportIconGlobal(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.8 4 6.2 4 9s-1.5 6.2-4 9c-2.5-2.8-4-6.2-4-9s1.5-6.2 4-9z" />
    </SvgRoot>
  );
}

export function SupportIconDeployment(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <path d="M3 17h18" />
      <path d="M6 17V9l6-4 6 4v8" />
      <path d="M10 17v-4h4v4" />
    </SvgRoot>
  );
}

export function SupportIconBespoke(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <path d="M12 3l2.2 6.8H21l-5.5 4 2.1 6.7L12 16.5 6.4 20.5l2.1-6.7L3 9.8h6.8L12 3z" />
    </SvgRoot>
  );
}

export function SupportIconWarranty(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 8.5-7 9-4-.5-7-4.5-7-9V6l7-3z" />
      <path d="M9.5 12.5l1.8 1.8 3.5-3.6" />
    </SvgRoot>
  );
}

export function SupportIconSoftware(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h6M9 13h4" />
      <path d="M8 4V2M16 4V2M8 20v2M16 20v2" />
    </SvgRoot>
  );
}

export function SupportIconSpareParts(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <path d="M3 7h18v13H3V7z" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
      <path d="M12 11v6M9.5 13.5h5" />
    </SvgRoot>
  );
}

export function SupportIconPartner(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <path d="M16 11c1.7 0 3-1.3 3-3S17.7 5 16 5s-3 1.3-3 3 1.3 3 3 3zM8 11c1.7 0 3-1.3 3-3S9.7 5 8 5 5 6.3 5 8s1.3 3 3 3z" />
      <path d="M16 13c-2.2 0-4 1.1-5 2.8M8 13c-2.2 0-4 1.1-5 2.8" />
      <path d="M12 21v-3M8 18h8" />
    </SvgRoot>
  );
}

export function SupportIconChannel(props: IconProps) {
  return (
    <SvgRoot {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M7 7V5a2 2 0 012-2h6a2 2 0 012 2v2" />
      <path d="M12 12v3" />
    </SvgRoot>
  );
}
