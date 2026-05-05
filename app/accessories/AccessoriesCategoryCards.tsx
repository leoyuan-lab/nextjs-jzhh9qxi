'use client';
import Image from 'next/image';

type Card = { title: string; body: string; image: string; alt: string };

export function AccessoriesCategoryCards({ cards }: { cards: readonly Card[] }) {
  return (
    <section className="accessories-cards" aria-label="categories">
      <div className="accessories-cards-grid">
        {cards.map((card) => (
          <article key={card.title} className="accessories-card">
            <div className="accessories-card-image">
              <Image
                src={card.image}
                alt={card.alt}
                fill
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 33vw"
                className="object-contain"
              />
            </div>
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
