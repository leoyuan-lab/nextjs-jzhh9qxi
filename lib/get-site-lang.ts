import { headers } from 'next/headers';

export async function getSiteLang(): Promise<'zh' | 'en'> {
  const h = await headers();
  return h.get('x-site-lang') === 'en' ? 'en' : 'zh';
}
