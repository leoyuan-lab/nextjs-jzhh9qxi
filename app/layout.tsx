import { cookies } from 'next/headers';
import './globals.css';
import ClientLayout from './ClientLayout';
import { rootMetadata } from '@/lib/site-seo';

export const metadata = rootMetadata;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const initialLang = jar.get('user-lang')?.value === 'en' ? 'en' : 'zh';

  return (
    <html lang={initialLang} suppressHydrationWarning>
      <body style={{ margin: 0 }}>
        <ClientLayout initialLang={initialLang}>{children}</ClientLayout>
      </body>
    </html>
  );
}
