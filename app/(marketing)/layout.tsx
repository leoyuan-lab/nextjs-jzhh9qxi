import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Collaborative Cobot Lineup',
  'Explore Apple Robot Cobots across r‑Lite, r‑Core, r‑Reach, r‑Max, and r‑Ultra—browse interactive robotic arm showcases and lineup entry points.',
);

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
