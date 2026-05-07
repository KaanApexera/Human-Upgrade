import { storage } from "./storage";
import { getUncachableStripeClient, getStripeSync, getStripeSecretKey } from "./stripeClient";
import type Stripe from "stripe";

// Price IDs mapping to subscription plans
export const PRICE_PLANS: Record<string, { plan: string; name: string }> = {
  basic_monthly: { plan: "basic", name: "Basic Monthly" },
  beta_monthly: { plan: "premium_monthly", name: "Beta Access" },
  premium_monthly: { plan: "premium_monthly", name: "Premium Monthly" },
  premium_annual: { plan: "premium_annual", name: "Premium Annual" },
};

// Map symbolic plan names to actual Stripe price IDs from secrets
export function getStripePriceId(planName: string): string {
  const priceMapping: Record<string, string | undefined> = {
    basic_monthly: process.env.STRIPE_PRICE_BASIC,
    beta_monthly: process.env.STRIPE_PRICE_BETA,
    premium_monthly: process.env.STRIPE_PRICE_PRO,
    premium_annual: process.env.STRIPE_PRICE_Yearly,
  };

  const stripePriceId = priceMapping[planName];
  
  if (!stripePriceId) {
    throw new Error(`No Stripe price ID configured for plan: ${planName}. Check your STRIPE_PRICE_* secrets.`);
  }
  
  return stripePriceId;
}

// Check if Stripe is available
export async function isStripeConfigured(): Promise<boolean> {
  try {
    await getUncachableStripeClient();
    return true;
  } catch {
    return false;
  }
}

// Create Stripe customer
export async function createStripeCustomer(
  email: string,
  userId: string
): Promise<Stripe.Customer> {
  const stripe = await getUncachableStripeClient();
  return stripe.customers.create({
    email,
    metadata: { userId },
  });
}

// Validate a promotion code against Stripe
export async function validatePromotionCode(
  code: string
): Promise<{ valid: boolean; couponId?: string; percentOff?: number; amountOff?: number; name?: string }> {
  try {
    const stripe = await getUncachableStripeClient();
    const promotionCodes = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
      expand: ['data.coupon'],
    });

    if (promotionCodes.data.length === 0) {
      return { valid: false };
    }

    const promoCode = promotionCodes.data[0] as Stripe.PromotionCode & { coupon: Stripe.Coupon };
    const coupon = promoCode.coupon;

    return {
      valid: true,
      couponId: coupon.id,
      percentOff: coupon.percent_off ?? undefined,
      amountOff: coupon.amount_off ? coupon.amount_off / 100 : undefined,
      name: coupon.name ?? code,
    };
  } catch (error) {
    console.error("Promo code validation error:", error);
    return { valid: false };
  }
}

// Create checkout session
export async function createCheckoutSession(
  userId: string,
  email: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  promoCode?: string
): Promise<Stripe.Checkout.Session> {
  const stripe = await getUncachableStripeClient();

  // Get or create Stripe customer
  const user = await storage.getUser(userId);
  let customerId = user?.stripeCustomerId;

  // Verify customer exists in current Stripe account, create new if not
  if (customerId) {
    try {
      await stripe.customers.retrieve(customerId);
    } catch (error) {
      // Customer doesn't exist in this Stripe account, create a new one
      console.log("Customer not found, creating new one");
      customerId = null;
    }
  }

  if (!customerId) {
    const customer = await createStripeCustomer(email, userId);
    customerId = customer.id;
    await storage.updateUser(userId, { stripeCustomerId: customerId });
  }

  // Determine plan from price lookup or metadata
  const plan = await getPlanFromPriceId(priceId);

  // Build checkout session options
  const sessionOptions: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId,
        plan,
      },
    },
    metadata: {
      userId,
      plan,
    },
  };

  // If promo code provided, look up the promotion code ID and add discounts
  if (promoCode) {
    try {
      const promotionCodes = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
        limit: 1,
      });

      if (promotionCodes.data.length > 0) {
        sessionOptions.discounts = [
          { promotion_code: promotionCodes.data[0].id }
        ];
      }
    } catch (error) {
      console.error("Failed to apply promo code:", error);
    }
  }

  const session = await stripe.checkout.sessions.create(sessionOptions);

  return session;
}

// Create billing portal session
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = await getUncachableStripeClient();
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// Handle webhook event via stripe-replit-sync
export async function handleWebhookEvent(
  payload: Buffer,
  signature: string,
  uuid: string
): Promise<void> {
  const stripeSync = await getStripeSync();
  await stripeSync.processWebhook(payload, signature, uuid);
}

// Process subscription changes from webhook data
export async function processSubscriptionUpdate(
  subscriptionId: string,
  userId: string,
  status: string,
  plan: string,
  currentPeriodEnd: number
): Promise<void> {
  const subscriptionStatus =
    status === "active"
      ? "active"
      : status === "past_due"
        ? "expired"
        : status === "canceled"
          ? "cancelled"
          : "inactive";

  await storage.updateUser(userId, {
    subscriptionPlan: plan,
    subscriptionStatus,
    stripeSubscriptionId: subscriptionId,
    renewalDate: new Date(currentPeriodEnd * 1000),
    pdfUploadsThisMonth: 0,
    lastUploadReset: new Date(),
  });
}

// Get plan from price ID (works with both symbolic names and actual Stripe price IDs)
export async function getPlanFromStripePrice(priceId: string): Promise<string> {
  return getPlanFromPriceId(priceId);
}

async function getPlanFromPriceId(priceId: string): Promise<string> {
  // First check if it's a symbolic name in our predefined mappings
  if (PRICE_PLANS[priceId]) {
    return PRICE_PLANS[priceId].plan;
  }

  // Check if it's an actual Stripe price ID by reverse-mapping from env vars
  const reversePriceMapping: Record<string, string> = {};
  if (process.env.STRIPE_PRICE_BASIC) {
    reversePriceMapping[process.env.STRIPE_PRICE_BASIC] = "basic";
  }
  if (process.env.STRIPE_PRICE_BETA) {
    reversePriceMapping[process.env.STRIPE_PRICE_BETA] = "premium_monthly";
  }
  if (process.env.STRIPE_PRICE_PRO) {
    reversePriceMapping[process.env.STRIPE_PRICE_PRO] = "premium_monthly";
  }
  if (process.env.STRIPE_PRICE_Yearly) {
    reversePriceMapping[process.env.STRIPE_PRICE_Yearly] = "premium_annual";
  }

  if (reversePriceMapping[priceId]) {
    return reversePriceMapping[priceId];
  }

  // Try to get from Stripe price metadata as fallback
  try {
    const stripe = await getUncachableStripeClient();
    const price = await stripe.prices.retrieve(priceId);
    return (price.metadata?.plan as string) || "premium_monthly";
  } catch {
    return "premium_monthly"; // Default
  }
}

// Re-export stripe getter for routes
export { getUncachableStripeClient as stripe };
