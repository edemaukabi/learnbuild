import LearnRoom from '@/components/learn/LearnRoom';

export default function LearnPage({ params }: { params: { slug: string } }) {
  return <LearnRoom slug={params.slug} />;
}
