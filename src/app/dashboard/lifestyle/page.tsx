import { prisma } from "@/lib/prisma";
import { renderSimpleMarkdown } from "@/lib/markdown";

export default async function LifestylePage() {
  const articles = await prisma.article.findMany({
    where: { category: "LIFESTYLE", published: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Lifestyle</h1>
      <div className="mt-6 space-y-8">
        {articles.map((article) => (
          <article
            key={article.id}
            className="rounded-2xl border border-black/10 p-6 dark:border-white/10"
          >
            <h2 className="font-semibold">{article.title}</h2>
            <div
              className="prose-content mt-2"
              dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(article.body) }}
            />
          </article>
        ))}
        {articles.length === 0 && (
          <p className="text-foreground/70">
            No lifestyle content published yet. Add LIFESTYLE articles via the
            seed script or database to fill this section.
          </p>
        )}
      </div>
    </div>
  );
}
