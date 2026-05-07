# Human Upgrade OS — Full Project Export

This archive contains everything needed to recreate the entire app in a new environment.

## Contents
- `human-upgrade-os.tar.gz` — complete source code (no node_modules, no build output)
- `database-full.sql` — PostgreSQL dump with schema + ALL data (users, biomarkers, protocols, etc.)
- `database-schema-only.sql` — schema only (empty tables, useful for fresh installs)

## Setup steps in a new environment

### 1. Extract source and install dependencies
```
mkdir human-upgrade-os && cd human-upgrade-os
tar -xzf ../human-upgrade-os.tar.gz
npm i
```

### 2. Create a PostgreSQL database and import data
```
createdb human_upgrade_os
psql "postgres://user:pass@host:5432/human_upgrade_os" < ../database-full.sql
```
Or for a fresh install with empty tables:
```
psql "postgres://..." < ../database-schema-only.sql
npm run db:push
```

### 3. Set environment variables
Create a `.env` file (or set in your hosting provider) with:

```
DATABASE_URL=postgres://user:pass@host:5432/human_upgrade_os
SESSION_SECRET=<generate with: openssl rand -hex 32>
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_BASIC=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_Yearly=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=production
PORT=5000
```

### 4. Recreate Stripe products if using a different Stripe account
The price IDs in the DB only work with Stripe account `acct_1TR8KlCOHXkDdsoq`.
If you use a different Stripe account, run:
```
STRIPE_SECRET_KEY=sk_test_xxx npx tsx scripts/setupStripeTestPrices.ts
```
This creates 3 products (Basic $39/mo, Premium $49/mo, Premium Annual $359/yr) and prints the new price IDs to put in your secrets.

### 5. Run it
Development:
```
npm run dev
```
Production:
```
npm run build
npm start
```
App listens on port 5000.

## Default admin login
Email: `admin@humanupgrade.os`
Password: `admin123`
(stored in users table — change immediately in production)

## Stripe test card
`4242 4242 4242 4242` / any future expiry / any CVC / any ZIP
