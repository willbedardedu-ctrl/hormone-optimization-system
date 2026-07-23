import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ManageBillingButton } from "@/components/manage-billing-button";

export default async function BillingPage() {
  const session = await auth();
  const subscription = session?.user?.id
    ? await prisma.subscription.findUnique({ where: { userId: session.user.id } })
    : null;

  return (
    <div>
      <h1 className="text-2xl font-bold">Billing</h1>
      {subscription ? (
        <div className="mt-6 rounded-2xl border border-black/10 p-6 dark:border-white/10">
          <p className="text-sm text-foreground/70">Status</p>
          <p className="font-semibold capitalize">{subscription.status}</p>
          <p className="mt-4 text-sm text-foreground/70">
            {subscription.cancelAtPeriodEnd ? "Access ends" : "Renews"} on{" "}
            {subscription.currentPeriodEnd.toLocaleDateString()}
          </p>
          <div className="mt-6">
            <ManageBillingButton />
          </div>
        </div>
      ) : (
        <p className="mt-6 text-foreground/70">No active subscription found.</p>
      )}
    </div>
  );
}
