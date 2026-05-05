'use client';

type Card = { title: string; body: string };

export function AccessoriesCategoryCards({ cards }: { cards: readonly Card[] }) {
  return (
    <section className="accessories-cards" aria-label="categories">
      <div className="accessories-cards-grid">
        {cards.map((card) => (
          <article key={card.title} className="accessories-card">
            <h2>{card.title}</h2>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
