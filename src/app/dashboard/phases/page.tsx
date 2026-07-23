import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function PhasesPage() {
  const phases = await prisma.article.findMany({
    where: { category: "PHASE", published: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Program Phases</h1>
      <div className="mt-6 space-y-4">
        {phases.map((phase) => (
          <Link
            key={phase.id}
            href={`/dashboard/phases/${phase.slug}`}
            className="block rounded-2xl border border-black/10 p-6 hover:border-accent dark:border-white/10"
          >
            <h2 className="font-semibold">{phase.title}</h2>
            <p className="mt-1 text-sm text-foreground/70">{phase.summary}</p>
          </Link>
        ))}
        {phases.length === 0 && (
          <p className="text-foreground/70">No phases published yet.</p>
        )}
      </div>
    </div>
  );
}
