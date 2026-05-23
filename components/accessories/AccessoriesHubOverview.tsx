'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AccessoryLaneSection, type AccessoryLaneCopy } from '@/components/accessories/AccessoryLaneSection';
import {
  ACCESSORY_LANE_ORDER,
  accessoryLaneHref,
  accessoryLaneSectionId,
  type AccessoryLaneId,
} from '@/lib/accessories-catalog';
import { controllerSpecs } from '@/data/products';
import { useSiteLang } from '@/lib/site-lang-context';

const CATEGORY_IMAGES: Record<AccessoryLaneId, string> = {
  controllers: '/images/robots/r-ultra-cobot-fr30-std.webp',
  grippers: '/images/robots/r-core-cobot-fr5-std.webp',
  fixtures: '/images/robots/r-max-cobot-fr16-std.webp',
};

type CategoryCardCopy = {
  sectionTitle: string;
  cards: Record<
    AccessoryLaneId,
    {
      title: string;
      summary: string;
      cta: string;
      liveBadge?: string;
      soonBadge?: string;
    }
  >;
};

type HubOverviewCopy = {
  categories: CategoryCardCopy;
  featured: {
    viewAll: string;
  };
  comingSoon: Record<
    Extract<AccessoryLaneId, 'grippers' | 'fixtures'>,
    { title: string; body: string; badge: string }
  >;
};

export function AccessoriesHubOverview({
  laneCopy,
  copy,
}: {
  laneCopy: AccessoryLaneCopy;
  copy: HubOverviewCopy;
}) {
  const lang = useSiteLang();
  const safeLang: 'zh' | 'en' = lang === 'en' ? 'en' : 'zh';
  const controllersCopy: AccessoryLaneCopy = {
    ...laneCopy,
    lanes: {
      ...laneCopy.lanes,
      controllers: {
        ...laneCopy.lanes.controllers,
        note:
          safeLang === 'zh' ? controllerSpecs.noteIntegrated.zh : controllerSpecs.noteIntegrated.en,
      },
    },
  };
  const viewAllHref = `/${safeLang}/accessories/controllers`;

  return (
    <div className="accessories-hub-overview">
      <section className="accessories-category-cards" aria-labelledby="accessories-category-cards-title">
        <div className="accessories-category-cards-header">
          <h2 id="accessories-category-cards-title" className="accessories-category-cards-title">
            {copy.categories.sectionTitle}
          </h2>
        </div>
        <div className="accessories-category-cards-grid">
          {ACCESSORY_LANE_ORDER.map((lane) => {
            const card = copy.categories.cards[lane];
            const href = `/${safeLang}${accessoryLaneHref(lane)}`;
            return (
              <Link key={lane} href={href} className="accessories-category-card">
                <div className="accessories-category-card-media">
                  <Image
                    src={CATEGORY_IMAGES[lane]}
                    alt={card.title}
                    fill
                    sizes="(max-width: 767px) 120px, 200px"
                    className="accessories-category-card-img object-contain"
                  />
                </div>
                <div className="accessories-category-card-body">
                  <h3 className="accessories-category-card-title">{card.title}</h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section
        id={accessoryLaneSectionId('controllers')}
        className="accessories-hub-featured"
        aria-labelledby="accessories-hub-featured-title"
      >
        <div className="accessories-hub-featured-header">
          <h2 id="accessories-hub-featured-title">{laneCopy.lanes.controllers.title}</h2>
          <Link href={viewAllHref} className="accessories-hub-featured-link">
            {copy.featured.viewAll}
            <span aria-hidden> ›</span>
          </Link>
        </div>
        <AccessoryLaneSection lane="controllers" lang={safeLang} copy={controllersCopy} showHeader={false} />
      </section>

      {(['grippers', 'fixtures'] as const).map((lane) => {
        const soon = copy.comingSoon[lane];
        return (
          <section
            key={lane}
            id={accessoryLaneSectionId(lane)}
            className="accessories-hub-soon"
            aria-labelledby={`${accessoryLaneSectionId(lane)}-title`}
          >
            <div className="accessories-hub-soon-inner">
              <p className="accessories-hub-soon-badge">{soon.badge}</p>
              <h2 id={`${accessoryLaneSectionId(lane)}-title`}>{soon.title}</h2>
              <p>{soon.body}</p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
