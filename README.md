# Hormone Optimization Coaching

A subscription membership platform: customers sign up, pay monthly via Stripe,
and get access to a members-only area with phase-by-phase nutrition, training,
and lifestyle coaching content.

## Stack

- **Next.js** (App Router, TypeScript) — website, member dashboard, and API in one app
- **Postgres + Prisma** — accounts, subscriptions, content
- **NextAuth (Auth.js)** — email/password login, JWT sessions
- **Stripe** — Checkout for monthly subscriptions + Billing Portal for managing/cancelling

## How it works

1. A visitor lands on `/`, sees the program, and creates an account at `/signup`.
2. They're sent to `/pricing` to subscribe. `/api/stripe/checkout` creates a
   Stripe Checkout session for the monthly price in `STRIPE_PRICE_ID`.
3. Stripe sends events to `/api/stripe/webhook`, which writes the
   subscription's status into the `Subscription` table.
4. `/dashboard` and everything under it is gated: the layout at
   `src/app/dashboard/layout.tsx` checks for an active subscription and
   redirects to `/pricing` if there isn't one.
5. Members browse `Phases`, `Nutrition`, `Workouts`, and `Lifestyle` —
   all pulled from the `Article` and `FoodItem` tables in Postgres.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the values (see comments in that
   file — you'll need a Postgres database and, once you're ready to test
   payments, Stripe test keys).
3. Create the database schema:
   ```bash
   npx prisma migrate dev
   ```
4. Seed the starter content (the phases and food library):
   ```bash
   npm run db:seed
   ```
5. Run the app:
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000.

## Setting up Stripe

1. Create a [Stripe](https://dashboard.stripe.com) account (test mode is fine
   to start).
2. Create a Product with a recurring monthly Price. Copy the Price ID
   (`price_...`) into `STRIPE_PRICE_ID`.
3. Copy your test **Secret key** into `STRIPE_SECRET_KEY` and your
   **Publishable key** into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
4. For local webhook testing, install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
   and run:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   This prints a webhook signing secret — put it in `STRIPE_WEBHOOK_SECRET`.
5. In production, add a webhook endpoint in the Stripe Dashboard pointing at
   `https://yourdomain.com/api/stripe/webhook` and use its signing secret.
6. Update the displayed price on `/pricing` (`src/app/pricing/page.tsx`) to
   match what you actually charge — it's just text, Stripe is the source of
   truth for billing.

## Adding your own content

Content lives in two tables, both editable via `prisma/seed.ts` (then run
`npm run db:seed` again) or directly with `npx prisma studio`:

- **`Article`** — has a `category` of `PHASE`, `NUTRITION`, `WORKOUT`, or
  `LIFESTYLE`, plus `title`, `summary`, and a `body` written in a small
  markdown subset (`## Heading`, `- list item`, blank-line-separated
  paragraphs — see `src/lib/markdown.ts`).
- **`FoodItem`** — entries in the hormone-hero food library (name, emoji,
  description, benefit tags).

There's no admin UI yet, so for now content changes go through the seed
script or Prisma Studio (`npm run db:studio`).

## Deploying

This app deploys well to [Vercel](https://vercel.com) with a managed Postgres
add-on (Vercel Postgres, Neon, or Supabase all work). Set the same
environment variables from `.env.example` in your hosting provider's
dashboard, run `npx prisma migrate deploy` against the production database,
then seed it.
