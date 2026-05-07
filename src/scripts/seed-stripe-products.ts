/**
 * Stripe Products Seed Script
 * 
 * This script creates the subscription products and prices in Stripe.
 * Run this once to set up your products in Stripe.
 * 
 * Usage: npx tsx scripts/seed-stripe-products.ts
 */

import { getUncachableStripeClient } from "../server/stripeClient";

interface ProductConfig {
  name: string;
  description: string;
  metadata: Record<string, string>;
  prices: Array<{
    nickname: string;
    unit_amount: number;
    currency: string;
    recurring: {
      interval: "month" | "year";
    };
    metadata: Record<string, string>;
  }>;
}

const PRODUCTS: ProductConfig[] = [
  {
    name: "Human Upgrade OS - Basic",
    description: "Essential health optimization with 1 PDF upload per month",
    metadata: {
      plan: "basic",
      tier: "1",
    },
    prices: [
      {
        nickname: "Basic Monthly",
        unit_amount: 3900, // $39.00
        currency: "usd",
        recurring: { interval: "month" },
        metadata: { plan: "basic", billing_cycle: "monthly" },
      },
    ],
  },
  {
    name: "Human Upgrade OS - Premium",
    description: "Complete health optimization with unlimited PDF uploads",
    metadata: {
      plan: "premium",
      tier: "2",
    },
    prices: [
      {
        nickname: "Premium Monthly",
        unit_amount: 4900, // $49.00
        currency: "usd",
        recurring: { interval: "month" },
        metadata: { plan: "premium_monthly", billing_cycle: "monthly" },
      },
      {
        nickname: "Premium Annual",
        unit_amount: 35900, // $359.00
        currency: "usd",
        recurring: { interval: "year" },
        metadata: { plan: "premium_annual", billing_cycle: "annual" },
      },
    ],
  },
];

async function seedProducts() {
  console.log("Starting Stripe products seed...\n");

  try {
    const stripe = await getUncachableStripeClient();
    console.log("Connected to Stripe\n");

    for (const productConfig of PRODUCTS) {
      // Check if product already exists
      const existingProducts = await stripe.products.search({
        query: `name:'${productConfig.name}'`,
      });

      let product;
      if (existingProducts.data.length > 0) {
        product = existingProducts.data[0];
        console.log(`Product "${productConfig.name}" already exists: ${product.id}`);
      } else {
        product = await stripe.products.create({
          name: productConfig.name,
          description: productConfig.description,
          metadata: productConfig.metadata,
        });
        console.log(`Created product "${productConfig.name}": ${product.id}`);
      }

      // Create prices for the product
      for (const priceConfig of productConfig.prices) {
        // Check if price already exists
        const existingPrices = await stripe.prices.list({
          product: product.id,
          active: true,
        });

        const matchingPrice = existingPrices.data.find(
          (p) =>
            p.unit_amount === priceConfig.unit_amount &&
            p.recurring?.interval === priceConfig.recurring.interval
        );

        if (matchingPrice) {
          console.log(`  Price "${priceConfig.nickname}" already exists: ${matchingPrice.id}`);
        } else {
          const price = await stripe.prices.create({
            product: product.id,
            nickname: priceConfig.nickname,
            unit_amount: priceConfig.unit_amount,
            currency: priceConfig.currency,
            recurring: priceConfig.recurring,
            metadata: priceConfig.metadata,
          });
          console.log(`  Created price "${priceConfig.nickname}": ${price.id}`);
        }
      }
      console.log("");
    }

    console.log("Stripe products seed completed successfully!");
    console.log("\nNow update your PRICING_PLANS in client/src/pages/Pricing.tsx");
    console.log("with the actual Stripe price IDs printed above.");
  } catch (error) {
    console.error("Failed to seed Stripe products:", error);
    process.exit(1);
  }
}

seedProducts();
