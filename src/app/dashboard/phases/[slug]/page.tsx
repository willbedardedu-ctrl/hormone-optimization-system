import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { renderSimpleMarkdown } from "@/lib/markdown";

export default async function PhaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const phase = await prisma.article.findUnique({ where: { slug } });
  if (!phase || phase.category !== "PHASE" || !phase.published) {
    notFound();
  }

  return (
    <article>
      <h1 className="text-2xl font-bold">{phase.title}</h1>
      {phase.summary && <p className="mt-2 text-foreground/70">{phase.summary}</p>}
      <div
        className="prose-content mt-6"
        dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(phase.body) }}
      />
    </article>
  );
}
