import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const phases = [
    {
      slug: "phase-1-reset",
      title: "Phase 1: The Reset",
      summary: "Detoxification and circadian rhythm alignment.",
      order: 1,
      body: `## Goal
Detoxification and circadian rhythm alignment.

## Key Focus
- Reducing endocrine disruptors (plastics, fragrances).
- Optimizing sleep hygiene.
- Blood sugar stabilization.
- Viewing sunlight within 30 minutes of waking.
- Auditing plastics, fragrances, and tap water filters.
- Eliminating inflammatory seed oils and processed sugars.

## Nutrition Strategy
High-fiber, anti-inflammatory, focused on gut health.`,
    },
    {
      slug: "phase-2-build",
      title: "Phase 2: The Build",
      summary: "Anabolic priming and nutrient density.",
      order: 2,
      body: `## Goal
Anabolic priming and nutrient density.

## Key Focus
- Increasing healthy fats (cholesterol for hormone production).
- Resistance training integration.
- Micronutrient loading (Zinc, Magnesium, Vitamin D).

## Nutrition Strategy
Caloric surplus/maintenance with high-quality protein and fats. In this phase, we maximize cholesterol and micronutrient intake to provide the raw materials for hormone synthesis.`,
    },
    {
      slug: "phase-3-optimize",
      title: "Phase 3: The Optimize",
      summary: "Peak performance and long-term maintenance.",
      order: 3,
      body: `## Goal
Peak performance and long-term maintenance.

## Key Focus
- Advanced supplementation (optional).
- Stress management (HPA axis optimization).
- Fine-tuning based on bio-feedback.

## Nutrition Strategy
Metabolic flexibility and strategic carbohydrate cycling. Advanced strategies for stress management, metabolic flexibility, and strategic carbohydrate cycling.`,
    },
  ];

  for (const phase of phases) {
    await prisma.article.upsert({
      where: { slug: phase.slug },
      update: phase,
      create: { ...phase, category: "PHASE" },
    });
  }

  const foods = [
    {
      name: "Sweet Potatoes",
      emoji: "🍠",
      description:
        "Sweet potatoes are essential for cortisol regulation. Complex carbohydrates stimulate a controlled insulin release which lowers cortisol levels—a hormone that, when chronically elevated, suppresses testosterone production.",
      benefits: ["Cortisol Management", "Vitamin A"],
      order: 1,
    },
    {
      name: "Grass-Fed Beef",
      emoji: "🥩",
      description:
        "Grass-fed beef is a primary source of zinc and saturated fats. Zinc is a critical cofactor for the production of testosterone, while saturated fats provide the cholesterol backbone needed for steroid hormone synthesis.",
      benefits: ["T-Building Blocks", "Zinc"],
      order: 2,
    },
    {
      name: "Broccoli",
      emoji: "🥦",
      description:
        "Contains Indole-3-Carbinol (I3C), which assists the liver in metabolizing excess estrogen. This helps maintain an optimal Testosterone-to-Estrogen ratio, reducing the risk of unwanted side effects from estrogen dominance.",
      benefits: ["Estrogen Balance"],
      order: 3,
    },
    {
      name: "Pomegranate",
      emoji: "🍎",
      description:
        "Pomegranate supports healthy blood flow and nitric oxide production, which is linked to improved testosterone levels and circulation.",
      benefits: ["Blood Flow", "Nitric Oxide"],
      order: 4,
    },
    {
      name: "Brazil Nuts",
      emoji: "🌰",
      description:
        "The richest dietary source of selenium. Selenium is essential for healthy thyroid function and sperm motility. Just two nuts per day provide the full recommended daily allowance.",
      benefits: ["Thyroid Health", "Selenium"],
      order: 5,
    },
    {
      name: "Eggs (Yolks)",
      emoji: "🥚",
      description:
        "Egg yolks are high in vitamin D and dietary cholesterol, both of which serve as precursors and cofactors for testosterone production.",
      benefits: ["Testosterone Precursor", "Vitamin D"],
      order: 6,
    },
    {
      name: "Pumpkin Seeds",
      emoji: "🎃",
      description:
        "An excellent source of zinc, which helps prevent the conversion of testosterone into estrogen and supports healthy hormone balance.",
      benefits: ["Zinc Support"],
      order: 7,
    },
  ];

  for (const food of foods) {
    const existing = await prisma.foodItem.findFirst({ where: { name: food.name } });
    if (existing) {
      await prisma.foodItem.update({ where: { id: existing.id }, data: food });
    } else {
      await prisma.foodItem.create({ data: food });
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
