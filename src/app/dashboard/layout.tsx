import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveSubscription } from "@/lib/subscription";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const subscription = await getActiveSubscription(session.user.id);
  if (!subscription) {
    redirect("/pricing?checkout=required");
  }

  return (
    <div className="mx-auto flex max-w-5xl gap-8 px-6 py-10">
      <aside className="w-48 shrink-0">
        <nav className="sticky top-24 space-y-1 text-sm font-medium">
          <Link
            href="/dashboard"
            className="block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          >
            Overview
          </Link>
          <Link
            href="/dashboard/phases"
            className="block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          >
            Phases
          </Link>
          <Link
            href="/dashboard/nutrition"
            className="block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          >
            Nutrition
          </Link>
          <Link
            href="/dashboard/workouts"
            className="block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          >
            Workouts
          </Link>
          <Link
            href="/dashboard/lifestyle"
            className="block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          >
            Lifestyle
          </Link>
          <Link
            href="/dashboard/billing"
            className="block rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
          >
            Billing
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
