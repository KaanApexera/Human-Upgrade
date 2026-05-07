import Stripe from 'stripe';

// Get credentials from environment secrets
function getCredentials() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }

  return {
    publishableKey: publishableKey || '',
    secretKey,
  };
}

// Get Stripe client - uncached, always fresh
export async function getUncachableStripeClient(): Promise<Stripe> {
  const { secretKey } = getCredentials();
  return new Stripe(secretKey);
}

// Get publishable key for frontend
export async function getStripePublishableKey(): Promise<string> {
  const { publishableKey } = getCredentials();
  return publishableKey;
}

// Get secret key
export async function getStripeSecretKey(): Promise<string> {
  const { secretKey } = getCredentials();
  return secretKey;
}

// StripeSync singleton for webhook processing and data sync
let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
