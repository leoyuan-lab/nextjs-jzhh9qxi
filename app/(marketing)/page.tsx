import dynamic from 'next/dynamic';

/** Code-split home experience so the main route module stays tiny; SSR still emits full HTML for crawlers. */
const HomePageClient = dynamic(() => import('./HomePageClient'), {
  loading: () => <main className="roooll-home-wrapper min-h-[100dvh] bg-white" aria-busy="true" />,
});

export default function HomePage() {
  return <HomePageClient />;
}
