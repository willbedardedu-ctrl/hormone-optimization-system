import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  if (!userId) return;

  const item = subscription.items.data[0];
  const currentPeriodEnd = item?.current_period_end;

  await prisma.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: subscription.id,
      stripePriceId: item?.price.id ?? "",
      status: subscription.status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : new Date(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
    create: {
      userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: item?.price.id ?? "",
      status: subscription.status,
      currentPeriodEnd: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000)
        : new Date(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("Missing stripe-signature header");
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          checkoutSession.subscription as string
        );
        await upsertSubscriptionFromStripe(subscription);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscriptionFromStripe(subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
