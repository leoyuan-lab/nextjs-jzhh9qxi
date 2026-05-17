import { getSiteLang } from '@/lib/get-site-lang';
import { getMessages } from '@/lib/messages';
import { AccessoriesCategoryCards } from './AccessoriesCategoryCards';

const CATEGORY_ORDER = ['end_effectors', 'vision', 'controllers'] as const;
const CATEGORY_IMAGES = {
  end_effectors: '/images/robots/r-lite-cobot-fr3-std.webp',
  vision: '/images/robots/r-lite-cobot-fr3-std.webp',
  controllers: '/images/robots/r-ultra-cobot-fr30-std.webp',
} as const;
const CATEGORY_ALT_KEY = {
  end_effectors: 'acc_end_effectors',
  vision: 'acc_vision',
  controllers: 'acc_controllers',
} as const;

export default async function AccessoriesPage() {
  const lang = await getSiteLang();
  const base = getMessages(lang).pages.accessories;
  const alt = getMessages(lang).alt;
  const cards = CATEGORY_ORDER.map((key) => {
    const c = base.categories[key];
    return {
      title: c.title,
      body: c.body,
      image: CATEGORY_IMAGES[key],
      alt: alt[CATEGORY_ALT_KEY[key]],
    };
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
