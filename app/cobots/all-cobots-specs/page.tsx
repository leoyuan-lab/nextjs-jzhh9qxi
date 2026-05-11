import dynamic from 'next/dynamic';

const AllCobotsSpecsClient = dynamic(() => import('./AllCobotsSpecsClient'), {
  loading: () => <div className="min-h-screen bg-[#f5f5f7]" aria-busy="true" />,
});

export default function AllCobotsSpecsPage() {
  return <AllCobotsSpecsClient />;
}
