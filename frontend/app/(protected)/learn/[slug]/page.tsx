import LearnRoom from '@/components/learn/LearnRoom';

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LearnRoom slug={slug} />;
}
