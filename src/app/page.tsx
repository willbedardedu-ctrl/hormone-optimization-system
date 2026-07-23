import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const phases = await prisma.article.findMany({
    where: { category: "PHASE", published: true },
    orderBy: { order: "asc" },
  });

  return (
    <div>
      <section className="border-b border-black/10 bg-gradient-to-b from-accent/10 to-transparent px-6 py-24 text-center dark:border-white/10">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 inline-block rounded-full bg-accent/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
            Monthly Coaching Membership
          </span>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Optimize your hormones. Train like it shows.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-foreground/70">
            A step-by-step nutrition, training, and lifestyle system to help you
            balance your hormones and build the body to match &mdash; delivered
            as an ongoing membership, not a one-off PDF.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/pricing"
              className="rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90"
            >
              View Membership
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-black/10 px-6 py-3 font-semibold hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/5"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-center text-2xl font-bold">What&apos;s inside</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
            <h3 className="font-semibold">Nutrition</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Hormone-focused food strategy and a library of hormone-hero foods,
              phase by phase.
            </p>
          </div>
          <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
            <h3 className="font-semibold">Training</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Workout guidance built around each phase so your training matches
              where your body is at.
            </p>
          </div>
          <div className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
            <h3 className="font-semibold">Lifestyle</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Sleep, stress, and daily habit coaching to support long-term
              hormone health.
            </p>
          </div>
        </div>
      </section>

      {phases.length > 0 && (
        <section className="border-t border-black/10 bg-black/[0.02] px-6 py-20 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold">The program phases</h2>
            <div className="mt-10 space-y-6">
              {phases.map((phase) => (
                <div
                  key={phase.id}
                  className="rounded-2xl border border-black/10 bg-background p-6 dark:border-white/10"
                >
                  <h3 className="text-lg font-semibold">{phase.title}</h3>
                  <p className="mt-1 text-sm text-foreground/70">{phase.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-6 py-20 text-center">
        <h2 className="text-2xl font-bold">Ready to start?</h2>
        <p className="mx-auto mt-3 max-w-md text-foreground/70">
          Join as a member and unlock the full phase-by-phase system.
        </p>
        <Link
          href="/pricing"
          className="mt-6 inline-block rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground hover:opacity-90"
        >
          See Membership Pricing
        </Link>
      </section>
    </div>
  );
}
