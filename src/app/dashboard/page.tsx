import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function DashboardOverview() {
  const session = await auth();

  return (
    <div>
      <h1 className="text-2xl font-bold">Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}</h1>
      <p className="mt-2 text-foreground/70">
        Here&apos;s your hormone optimization membership. Pick up where you left
        off.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/phases"
          className="rounded-2xl border border-black/10 p-6 hover:border-accent dark:border-white/10"
        >
          <h2 className="font-semibold">Program Phases</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Reset, Build, and Optimize &mdash; your step-by-step system.
          </p>
        </Link>
        <Link
          href="/dashboard/nutrition"
          className="rounded-2xl border border-black/10 p-6 hover:border-accent dark:border-white/10"
        >
          <h2 className="font-semibold">Nutrition</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Hormone-hero foods and nutrition guidance.
          </p>
        </Link>
        <Link
          href="/dashboard/workouts"
          className="rounded-2xl border border-black/10 p-6 hover:border-accent dark:border-white/10"
        >
          <h2 className="font-semibold">Workouts</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Training guidance built around each phase.
          </p>
        </Link>
        <Link
          href="/dashboard/lifestyle"
          className="rounded-2xl border border-black/10 p-6 hover:border-accent dark:border-white/10"
        >
          <h2 className="font-semibold">Lifestyle</h2>
          <p className="mt-1 text-sm text-foreground/70">
            Sleep, stress, and daily habits.
          </p>
        </Link>
      </div>
    </div>
  );
}
