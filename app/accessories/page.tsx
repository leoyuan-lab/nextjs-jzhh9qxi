import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { AccessoriesCategoryCards } from './AccessoriesCategoryCards';

const CATEGORY_ORDER = ['end_effectors', 'vision', 'controllers'] as const;

export default async function AccessoriesPage() {
  const lang = await getSiteLang();
  const base = getMessages(lang).pages.accessories;
  const cards = CATEGORY_ORDER.map((key) => {
    const c = base.categories[key];
    return { title: c.title, body: c.body };
  });
  return (
    <>
      <div className="accessories-hub-intro">
        <h1>{base.introTitle}</h1>
        <p>{base.introBody}</p>
      </div>
      <AccessoriesCategoryCards cards={cards} />
    </>
  );
}
