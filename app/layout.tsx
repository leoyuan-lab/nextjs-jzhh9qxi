import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import './globals.css';
import ClientLayout from './ClientLayout';
import { Suspense } from 'react';
import { GoogleAnalytics } from '@/components/GoogleAnalytics';
import { GoogleAnalyticsPageView } from '@/components/GoogleAnalyticsPageView';
import { OrganizationJsonLd } from '@/components/OrganizationJsonLd';
import { getRequestSiteOrigin } from '@/lib/site-origin';
import { rootMetadata } from '@/lib/site-seo';

export const metadata = rootMetadata;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const reqHeaders = await headers();
  const headerLang = reqHeaders.get('x-site-lang');
  const cookieLang = jar.get('user-lang')?.value;
  const initialLang =
    headerLang === 'en' || headerLang === 'zh'
      ? headerLang
      : cookieLang === 'en'
        ? 'en'
        : 'zh';

  const siteOrigin = await getRequestSiteOrigin();

  return (
    <html lang={initialLang} suppressHydrationWarning>
      <body style={{ margin: 0 }}>
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <GoogleAnalyticsPageView />
        </Suspense>
        <OrganizationJsonLd origin={siteOrigin} />
        <ClientLayout initialLang={initialLang}>{children}</ClientLayout>
      </body>
    </html>
  );
}
