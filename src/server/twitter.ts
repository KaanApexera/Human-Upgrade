import { TwitterApi } from "twitter-api-v2";

function getClient() {
  const { TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET } = process.env;
  console.log("🐦 Twitter creds check:", {
    apiKey: TWITTER_API_KEY ? `${TWITTER_API_KEY.slice(0,4)}...${TWITTER_API_KEY.slice(-4)}` : "MISSING",
    apiSecret: TWITTER_API_SECRET ? `${TWITTER_API_SECRET.slice(0,4)}...${TWITTER_API_SECRET.slice(-4)}` : "MISSING",
    accessToken: TWITTER_ACCESS_TOKEN ? `${TWITTER_ACCESS_TOKEN.slice(0,8)}...${TWITTER_ACCESS_TOKEN.slice(-4)}` : "MISSING",
    accessSecret: TWITTER_ACCESS_SECRET ? `${TWITTER_ACCESS_SECRET.slice(0,4)}...${TWITTER_ACCESS_SECRET.slice(-4)}` : "MISSING",
  });
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
  `You're not lazy.
You're not weak.
You're not "just getting older."

Your biology is off — and your blood test proves it.

Upload yours free → humanupgrade.app`,

  `The biohackers who look 10 years younger than their age all have one thing in common:

They don't guess their health. They measure it.

Start measuring → humanupgrade.app`,

  `Unpopular opinion:

Most people are walking around with fixable problems they don't know they have.

Low vitamin D. High cortisol. Insulin resistance.

All in your blood test. All fixable.

humanupgrade.app`,

  `Your body has been sending you signals for years.

Tired after 8 hours of sleep.
Can't lose weight no matter what.
Brain fog by noon.
Mood swings for no reason.

These aren't random. They're data.

humanupgrade.app`,

  `What if looking and feeling 10 years younger was actually just a blood test away?

Not hype. Not supplements.

Just knowing what your body actually needs.

humanupgrade.app`,

  `"My doctor said everything was normal."

Normal ≠ optimal.

The range your lab uses includes the bottom 5% and top 5% of the population.

You deserve better than "not sick."

humanupgrade.app`,

  `The best version of you isn't a motivation problem.

It's a biology problem.

And biology has data.

humanupgrade.app`,

  `People spend $200/month on supplements they don't need.

Meanwhile the answer is already in their blood test — sitting unread.

humanupgrade.app — free analysis`,

  `If you've ever felt like your body is working against you—

It might literally be.

High inflammation. Hormonal imbalance. Poor metabolic health.

All detectable. All reversible.

humanupgrade.app`,

  `Biohacking isn't just for billionaires anymore.

Upload your blood test.
Get your biological age.
Get your exact protocol.

Free to start → humanupgrade.app`,

  `There are two types of people in 2025:

Those who guess their health.
Those who know it.

The second group ages slower, thinks clearer, performs better.

humanupgrade.app`,

  `You don't need a $10,000 health retreat.

You need to actually read what your blood test is telling you.

We do that for you. Free.

humanupgrade.app`,

  `Longevity isn't luck.

It's low inflammation.
Optimized hormones.
Stable blood sugar.
Tracked biological age.

Everything measurable. Everything improvable.

humanupgrade.app`,

  `Most 35-year-olds have the biology of a 45-year-old.

Some 45-year-olds have the biology of a 32-year-old.

The difference? They actually looked at their data.

humanupgrade.app`,

  `Your morning coffee isn't the problem.

Your cortisol is.

And it's been showing up in your blood test this whole time.

humanupgrade.app`,

  `If you're training hard and not seeing results—

Your blood work is the missing piece.

Testosterone. IGF-1. Vitamin D. Cortisol.

These 4 markers explain 90% of plateaus.

humanupgrade.app`,

  `The best investment you can make in 2025:

Understanding your own biology.

Not a gym membership.
Not another supplement.

Your data. Your protocol.

humanupgrade.app`,

  `"I just thought I was tired because I was busy."

No. You were tired because your ferritin was at 12 and your thyroid was struggling.

Your blood test knew. You didn't.

humanupgrade.app`,

  `Peak performance isn't a mindset.

It's a metabolic state.

And it starts with knowing where you actually are.

Free blood test analysis → humanupgrade.app`,

  `What aging fast actually looks like:

→ Always tired
→ Can't build muscle
→ Brain fog
→ Weight gain without eating more
→ Mood that's "just off"

None of this is inevitable.

humanupgrade.app`,

  `Bryan Johnson spends $2M/year optimizing his biology.

You can start for $0.

Upload your blood test → humanupgrade.app`,

  `The supplement industry makes $50B/year selling you things you might not need.

Your blood test shows exactly what you're missing.

Stop guessing. Start knowing.

humanupgrade.app`,

  `Most people find out something is wrong when it becomes a disease.

Your blood markers show the warning signs 5-10 years earlier.

Don't wait.

humanupgrade.app`,

  `Upgrade your biology in 3 steps:

1. Upload your blood test (60 seconds)
2. See your biological age score
3. Get your personalized protocol

Free to start → humanupgrade.app`,

  `You've been told to eat well, sleep more, and exercise.

But nobody told you WHY it's not working for you specifically.

Your biology has the answer.

humanupgrade.app`,

  `Belly fat that won't move.
Poor sleep despite being exhausted.
Anxiety for no reason.
Craving sugar all day.

This is high cortisol. It's in your blood test.

humanupgrade.app`,

  `The people who look incredible in their 40s and 50s aren't just lucky.

They optimized early. They measured consistently. They acted on data.

You can too → humanupgrade.app`,

  `Your blood test is either sitting in a drawer or one click away right now.

In 60 seconds you'll know your biological age and exactly what to fix.

Free → humanupgrade.app`,
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
