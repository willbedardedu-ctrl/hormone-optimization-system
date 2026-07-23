import Stripe from "stripe";

// Falls back to a placeholder during build/local setup so module import
// never throws before STRIPE_SECRET_KEY is configured. Routes that call
// Stripe check for a real key first and return a friendly error instead.
const apiKey = process.env.STRIPE_SECRET_KEY || "sk_test_not_configured";

export const stripe = new Stripe(apiKey, {
  apiVersion: "2026-06-24.dahlia",
});
