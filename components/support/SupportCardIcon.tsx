import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Larger icon for card headers (48px). */
  size?: 'default' | 'large';
};

export function SupportCardIcon({ children, size = 'default' }: Props) {
  return (
    <div
      className={`support-card-icon${size === 'large' ? ' support-card-icon--large' : ''}`}
    >
      {children}
    </div>
  );
}
