import { redirect } from 'next/navigation';

import { getSiteLang } from '@/lib/get-site-lang';

/** Hub carousel lives on the homepage (`/#applications`); keep route as a stable redirect. */
export default async function ApplicationsHubPage() {
  const lang = await getSiteLang();
  redirect(`/${lang}/#applications`);
}
