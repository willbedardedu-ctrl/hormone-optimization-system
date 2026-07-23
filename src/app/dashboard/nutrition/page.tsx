import { prisma } from "@/lib/prisma";
import { renderSimpleMarkdown } from "@/lib/markdown";

export default async function NutritionPage() {
  const [articles, foods] = await Promise.all([
    prisma.article.findMany({
      where: { category: "NUTRITION", published: true },
      orderBy: { order: "asc" },
    }),
    prisma.foodItem.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Nutrition</h1>

      {articles.length > 0 && (
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
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold">Hormone-Hero Food Library</h2>
      <p className="mt-1 text-sm text-foreground/70">
        Foods that specifically support hormone balance and production.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {foods.map((food) => (
          <div
            key={food.id}
            className="rounded-2xl border border-black/10 p-5 dark:border-white/10"
          >
            <h3 className="font-semibold">
              {food.emoji && <span className="mr-2">{food.emoji}</span>}
              {food.name}
            </h3>
            <p className="mt-2 text-sm text-foreground/70">{food.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {food.benefits.map((benefit) => (
                <span
                  key={benefit}
                  className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        ))}
        {foods.length === 0 && (
          <p className="text-foreground/70">No foods published yet.</p>
        )}
      </div>
    </div>
  );
}
