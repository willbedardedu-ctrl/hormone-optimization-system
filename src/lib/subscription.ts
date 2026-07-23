import { prisma } from "@/lib/prisma";

const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export async function getActiveSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  if (!subscription) return null;
  return ACTIVE_STATUSES.has(subscription.status) ? subscription : null;
}
