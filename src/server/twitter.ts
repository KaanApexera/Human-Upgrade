import { TwitterApi } from "twitter-api-v2";

function getClient() {
  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;
  if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_SECRET) return null;
  return new TwitterApi({
    appKey: TWITTER_API_KEY,
    appSecret: TWITTER_API_SECRET,
    accessToken: TWITTER_ACCESS_TOKEN,
    accessSecret: TWITTER_ACCESS_SECRET,
  }).readWrite;
}

// 28 rotating tweets — 4/week = 7 weeks of unique content
const TWEETS = [
  // HOOK — Tiredness
  `Most people accept being tired as "just how life is."

It's not.

Tiredness has a biological cause — and your blood test tells you exactly what it is.

Upload yours → humanupgrade.app`,

  // STAT — Biological age
  `Studies show your biological age can differ from your real age by up to 15 years.

Some 40-year-olds have the body of a 30-year-old.
Some 30-year-olds have the body of a 45-year-old.

Find out which one you are → humanupgrade.app`,

  // HOOK — Weight loss
  `You're eating right. You're working out.
The weight still won't move.

This isn't willpower. It's biology.

Your blood test shows exactly what's blocking your metabolism.

humanupgrade.app`,

  // EDUCATIONAL — What blood test reveals
  `Your blood test tells you:

→ Why you're always tired
→ Why you can't lose weight
→ Why your mood crashes at 3pm
→ Why you're aging faster than you should

Most doctors just say "everything's normal."
Normal ≠ optimal.

humanupgrade.app`,

  // HOOK — Aging
  `In 90 days, you can look and feel 5-10 years younger.

Not with skincare. Not with surgery.

By fixing what's actually wrong inside — based on your own blood markers.

humanupgrade.app`,

  // SOCIAL PROOF
  `"My doctor said my results were normal. Human Upgrade showed me 6 things that were technically normal but nowhere near optimal. Game changer."

— David R., 41

Your blood test is a goldmine. Are you reading it?

humanupgrade.app`,

  // EDUCATIONAL — Biological age
  `Biological age is the age your body actually functions at — not your birthday.

A 45-year-old can have a biological age of 33.
A 30-year-old can have a biological age of 42.

Which one are you?

Find out free → humanupgrade.app`,

  // HOOK — Energy
  `The reason your energy crashes every afternoon isn't caffeine.

It's not sleep either.

It's usually cortisol, insulin, or thyroid — all visible in your blood test.

Get your answer → humanupgrade.app`,

  // EDUCATIONAL — What optimal means
  `There's a difference between "normal" and "optimal."

Normal: within the lab reference range (bottom 5% to top 5%)
Optimal: where peak performers actually sit

Your doctor checks for disease.
We optimize for peak performance.

humanupgrade.app`,

  // HOOK — Testosterone
  `Low testosterone symptoms:
→ Always tired
→ Hard to build muscle
→ Low motivation
→ Brain fog
→ Poor sleep

Sound familiar? Your blood test will confirm it — and we'll tell you exactly how to fix it.

humanupgrade.app`,

  // EDUCATIONAL — How it works
  `How to decode your blood test in 3 steps:

1️⃣ Upload your PDF (any standard test)
2️⃣ Get your biological age score
3️⃣ Get your exact protocol — supplements, sleep, nutrition

Takes 60 seconds. Free to start.

humanupgrade.app`,

  // HOOK — Inflammation
  `Chronic inflammation is the silent driver of:
→ Early aging
→ Brain fog
→ Joint pain
→ Fatigue
→ Weight gain

It shows up clearly in your blood test.
Most people have it and have no idea.

humanupgrade.app`,

  // STAT — Longevity
  `The top 1% don't guess their health.

They track biomarkers. They optimize protocols. They measure their biological age.

Now you can do the same — starting with your next blood test.

humanupgrade.app`,

  // HOOK — Sleep
  `Bad sleep isn't random.

It's usually low magnesium, high cortisol, or poor melatonin regulation — all traceable in your blood.

Fix the root cause, not the symptom.

humanupgrade.app`,

  // EDUCATIONAL — Free tier
  `Most health optimization tools cost $300+/month.

We started free.

Upload your blood test, get your biological age, get your protocol.

No credit card. No catch.

humanupgrade.app`,

  // HOOK — Doctor comparison
  `Your doctor has 7 minutes per appointment.

They check if you're sick — not if you're optimal.

There's a big difference between "not sick" and "performing at your best."

humanupgrade.app`,

  // EDUCATIONAL — Supplements
  `The supplement industry wants you to buy everything.

Your body only needs what your blood test shows it's missing.

Stop guessing. Start targeting.

humanupgrade.app`,

  // HOOK — Longevity
  `Bryan Johnson spends $2M/year to reverse his biological age.

You don't need $2M.

You need your blood test results and the right protocol.

Start free → humanupgrade.app`,

  // EDUCATIONAL — Hormones
  `Hormones affect everything:
→ Energy
→ Body composition
→ Mood
→ Sleep quality
→ Libido
→ Mental clarity

They're all measurable. They're all optimizable.

humanupgrade.app`,

  // HOOK — Generic health advice
  `"Eat well. Exercise. Sleep 8 hours."

Everyone knows this. Nobody tells you *why* it's not working for you specifically.

Your blood test does.

humanupgrade.app`,

  // STAT — Early detection
  `Most chronic diseases show warning signs in blood markers 5-10 years before symptoms appear.

Your last blood test might already be telling you something important.

humanupgrade.app`,

  // HOOK — Muscle building
  `Struggling to build muscle despite training hard?

Check your testosterone, IGF-1, and vitamin D.

These 3 markers alone explain most plateaus.

humanupgrade.app`,

  // EDUCATIONAL — What we analyze
  `What we analyze in your blood test:

🔴 Inflammation (CRP, IL-6)
🟡 Hormones (testosterone, cortisol, thyroid)
🔵 Metabolic (glucose, insulin, HbA1c)
⚪ Vitamins & minerals (D3, B12, magnesium, zinc)
🟢 Cardiovascular (lipids, homocysteine)

humanupgrade.app`,

  // HOOK — Anti-aging
  `Anti-aging isn't about creams.

It's about:
→ Keeping inflammation low
→ Optimizing hormones
→ Protecting metabolic health
→ Tracking biological age

All measurable. All fixable.

humanupgrade.app`,

  // SOCIAL PROOF 2
  `"Lost 18 lbs in 8 weeks. Turns out my insulin resistance was the real problem — not my diet."

— Sarah K., 29

Find your real blocker → humanupgrade.app`,

  // EDUCATIONAL — Cortisol
  `High cortisol is the #1 reason for:
→ Belly fat that won't move
→ Poor sleep despite exhaustion
→ Anxiety without reason
→ Craving sugar and carbs

It's measurable. It's fixable.

humanupgrade.app`,

  // HOOK — Beta offer
  `For our first 50 beta users:

Full Pro access for $1/month.

Blood test analysis + biological age + full protocol + weekly reports.

Normally $29/month.

→ humanupgrade.app`,

  // CLOSING — CTA
  `Your blood test is either sitting in a drawer or accessible online right now.

In 60 seconds you could know:
✓ Your biological age
✓ What's slowing you down
✓ Exactly how to fix it

humanupgrade.app — free to start`,
];

// Track last posted index in memory (resets on restart, good enough for weekly cadence)
let lastIndex = -1;

function getNextTweet(): string {
  lastIndex = (lastIndex + 1) % TWEETS.length;
  return TWEETS[lastIndex];
}

export async function postScheduledTweet(): Promise<{ success: boolean; tweet?: string; error?: string }> {
  const client = getClient();
  if (!client) return { success: false, error: "Twitter credentials not configured" };

  const tweet = getNextTweet();
  try {
    await client.v2.tweet(tweet);
    console.log(`✅ Tweet posted (#${lastIndex + 1}/${TWEETS.length})`);
    return { success: true, tweet };
  } catch (err: any) {
    console.error("Twitter post error:", err);
    return { success: false, error: err.message };
  }
}
