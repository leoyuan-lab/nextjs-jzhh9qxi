import Link from 'next/link';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { pageMetadata } from '@/lib/site-seo';

export const metadata: Metadata = pageMetadata(
  'Page Not Found',
  'Requested Cobot or robotic arm page unavailable; browse the lineup from the homepage.',
);

export default async function NotFound() {
  const h = await headers();
  const lang = h.get('x-site-lang') === 'en' ? 'en' : 'zh';
  const home = `/${lang}/`;
  return (
    <div className="seo-brief-root" style={{ textAlign: 'center' }}>
      <div className="seo-brief-inner">
        <h1>404</h1>
        <p>This Cobot robotic arm page does not exist or moved.</p>
        <Link href={home} className="seo-brief-link">
          Return home
        </Link>
      </div>
    </div>
  );
}
