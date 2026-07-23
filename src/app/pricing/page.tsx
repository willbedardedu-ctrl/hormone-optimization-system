import { auth } from "@/lib/auth";
import { SubscribeButton } from "@/components/subscribe-button";

export default async function PricingPage() {
  const session = await auth();

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <div className="rounded-2xl border border-black/10 p-8 text-center dark:border-white/10">
        <span className="mb-3 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent">
          Membership
        </span>
        <h1 className="text-3xl font-bold">Hormone Optimization Coaching</h1>
        <p className="mt-4 text-4xl font-extrabold">
          $49<span className="text-base font-medium text-foreground/60">/month</span>
        </p>
        <ul className="mt-6 space-y-2 text-left text-sm text-foreground/80">
          <li>&#10003; Full phase-by-phase nutrition system</li>
          <li>&#10003; Hormone-hero food library</li>
          <li>&#10003; Training guidance for every phase</li>
          <li>&#10003; Lifestyle &amp; sleep coaching</li>
          <li>&#10003; Cancel anytime</li>
        </ul>
        <div className="mt-8">
          <SubscribeButton loggedIn={!!session?.user} />
        </div>
      </div>
    </div>
  );
}
