import Stripe from "stripe";

async function main() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);

  console.log("Connecting to Stripe...");
  const account = await stripe.accounts.retrieve();
  console.log(`Connected to Stripe account: ${account.id}`);
  console.log(`Mode: ${secretKey.startsWith("sk_test_") ? "TEST/SANDBOX" : "LIVE"}\n`);

  const plans = [
    {
      envKey: "STRIPE_PRICE_BASIC",
      productName: "Human Upgrade OS - Basic",
      productDescription: "Essential health optimization with monthly biomarker analysis",
      unitAmount: 3900,
      interval: "month" as const,
    },
    {
      envKey: "STRIPE_PRICE_PRO",
      productName: "Human Upgrade OS - Premium",
      productDescription: "Complete health optimization with unlimited uploads and advanced features",
      unitAmount: 4900,
      interval: "month" as const,
    },
    {
      envKey: "STRIPE_PRICE_Yearly",
      productName: "Human Upgrade OS - Premium Annual",
      productDescription: "Best value annual subscription - save over $200/year",
      unitAmount: 35900,
      interval: "year" as const,
    },
  ];

  const results: Record<string, string> = {};

  for (const plan of plans) {
    console.log(`Creating product: ${plan.productName}`);
    const product = await stripe.products.create({
      name: plan.productName,
      description: plan.productDescription,
    });

    console.log(`  Product created: ${product.id}`);

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.unitAmount,
      currency: "usd",
      recurring: { interval: plan.interval },
    });

    console.log(`  Price created: ${price.id} ($${(plan.unitAmount / 100).toFixed(2)}/${plan.interval})\n`);
    results[plan.envKey] = price.id;
  }

  console.log("=".repeat(70));
  console.log("DONE! Update these secrets in Replit Secrets with the values below:");
  console.log("=".repeat(70));
  for (const [key, value] of Object.entries(results)) {
    console.log(`${key} = ${value}`);
  }
  console.log("=".repeat(70));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
