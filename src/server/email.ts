import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Human Upgrade <noreply@humanupgrade.app>";
const APP_URL = process.env.APP_URL || "https://humanupgrade.app";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  return new Resend(process.env.RESEND_API_KEY);
}

const BASE_STYLE = `font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#f5f5f5;border-radius:12px;border:1px solid #222;overflow:hidden;`;

const header = () => `
  <div style="background:#111;padding:24px 32px;border-bottom:1px solid #1e1e1e;">
    <span style="font-size:20px;font-weight:700;color:#fff;">Human Upgrade <span style="color:#DC2626;">OS</span></span>
  </div>
`;

const footer = () => `
  <div style="padding:24px 32px;border-top:1px solid #1e1e1e;background:#080808;">
    <p style="color:#444;font-size:12px;margin:0;">
      Human Upgrade OS · <a href="${APP_URL}" style="color:#555;text-decoration:none;">humanupgrade.app</a><br/>
      Not medical advice. For informational purposes only.
    </p>
  </div>
`;

const btn = (href: string, text: string) =>
  `<a href="${href}" style="display:inline-block;background:#DC2626;color:#fff;padding:12px 28px;border-radius:8px;font-weight:600;text-decoration:none;">${text}</a>`;

// ─────────────────────────────────────────────
// 1. WELCOME EMAIL (with tutorial)
// ─────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const steps = [
    { n: "1", icon: "🧬", title: "Upload Your Blood Work", desc: "PDF or photo from any lab. Our AI reads 50+ biomarkers automatically." },
    { n: "2", icon: "⏱️", title: "Get Your Performance Age™", desc: "See how old your body actually performs — not just your birth year." },
    { n: "3", icon: "💊", title: "Follow Your Protocol", desc: "Supplements, peptides, sleep & workout plan — all tailored to your data." },
    { n: "4", icon: "📈", title: "Track Your Progress", desc: "Upload new labs to watch your biological age improve over time." },
    { n: "5", icon: "🔗", title: "Refer & Earn", desc: "Share your referral link. For every friend who subscribes, you get credit." },
  ];

  const stepsHtml = steps.map(s => `
    <div style="display:flex;gap:16px;align-items:flex-start;padding:12px 0;border-bottom:1px solid #1a1a1a;">
      <div style="width:32px;height:32px;border-radius:50%;background:#DC2626/20;border:1px solid #DC2626/30;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;">
        ${s.icon}
      </div>
      <div>
        <p style="margin:0 0 2px;font-weight:600;font-size:14px;color:#fff;">${s.n}. ${s.title}</p>
        <p style="margin:0;font-size:13px;color:#888;">${s.desc}</p>
      </div>
    </div>
  `).join("");

  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `Welcome to Human Upgrade OS, ${name || "Optimizer"} 👋`,
    html: `
      <div style="${BASE_STYLE}">
        ${header()}
        <div style="padding:32px;">
          <h1 style="font-size:24px;font-weight:700;margin:0 0 8px;">Welcome, ${name || "Optimizer"} 👋</h1>
          <p style="color:#888;line-height:1.7;margin:0 0 28px;">
            You're now part of the next evolution in personal health optimization. Here's how to get the most out of Human Upgrade OS in 5 steps:
          </p>

          <div style="margin-bottom:28px;">
            ${stepsHtml}
          </div>

          <div style="text-align:center;margin-bottom:28px;">
            ${btn(`${APP_URL}/dashboard`, "Go to Dashboard →")}
          </div>

          <div style="background:#111;border:1px solid #1e1e1e;border-radius:10px;padding:16px;text-align:center;">
            <p style="margin:0 0 4px;font-size:13px;color:#888;">🔬 Pro tip</p>
            <p style="margin:0;font-size:13px;color:#aaa;">Upload your most recent blood panel first — even a basic panel gives you a Performance Age™ score and a full optimization protocol.</p>
          </div>
        </div>
        ${footer()}
      </div>
    `,
  });

  if (error) console.error("Welcome email error:", error);
}

// ─────────────────────────────────────────────
// 2. PASSWORD RESET EMAIL
// ─────────────────────────────────────────────
export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: "Reset your Human Upgrade OS password",
    html: `
      <div style="${BASE_STYLE}">
        ${header()}
        <div style="padding:32px;">
          <h1 style="font-size:22px;font-weight:700;margin:0 0 12px;">Reset your password</h1>
          <p style="color:#888;line-height:1.7;margin:0 0 24px;">
            We received a request to reset your password. This link expires in <strong style="color:#fff;">1 hour</strong>.
          </p>
          ${btn(resetUrl, "Reset Password →")}
          <p style="color:#444;font-size:13px;margin-top:24px;">
            If you didn't request a password reset, you can safely ignore this email. Your password will not change.
          </p>
        </div>
        ${footer()}
      </div>
    `,
  });
  if (error) console.error("Password reset email error:", error);
}

// ─────────────────────────────────────────────
// 3. WEEKLY REPORT EMAIL
// ─────────────────────────────────────────────
export async function sendWeeklyReportEmail(
  to: string,
  name: string,
  referralCode?: string
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const referralUrl = referralCode ? `${APP_URL}/register?ref=${referralCode}` : `${APP_URL}/register`;

  const tips = [
    "💧 Hydrate first thing — 500ml water before coffee resets cortisol naturally.",
    "😴 Sleep before midnight. Growth hormone peaks in the first sleep cycle.",
    "🏋️ Train 3-5x this week. Resistance training is the #1 longevity biomarker.",
    "🩸 Due for new labs? Upload fresh bloodwork to update your Performance Age™.",
  ];
  const tip = tips[new Date().getDay() % tips.length];

  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `Your weekly Human Upgrade report 📊`,
    html: `
      <div style="${BASE_STYLE}">
        ${header()}
        <div style="padding:32px;">
          <h1 style="font-size:22px;font-weight:700;margin:0 0 4px;">Your Weekly Report</h1>
          <p style="color:#555;font-size:13px;margin:0 0 24px;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

          <p style="color:#aaa;line-height:1.7;margin:0 0 24px;">
            Hey ${name || "Optimizer"}, here's your weekly check-in from Human Upgrade OS.
          </p>

          <!-- Weekly tip -->
          <div style="background:#111;border-left:3px solid #DC2626;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;">
            <p style="margin:0 0 4px;font-size:11px;color:#DC2626;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">This Week's Protocol Tip</p>
            <p style="margin:0;font-size:14px;color:#e5e5e5;">${tip}</p>
          </div>

          <!-- CTAs -->
          <div style="display:grid;gap:12px;margin-bottom:28px;">
            <a href="${APP_URL}/dashboard" style="display:block;background:#DC2626;color:#fff;padding:14px 24px;border-radius:8px;font-weight:600;text-decoration:none;text-align:center;">
              📊 View My Dashboard
            </a>
            <a href="${APP_URL}/dashboard" style="display:block;background:#111;color:#fff;padding:14px 24px;border-radius:8px;font-weight:600;text-decoration:none;text-align:center;border:1px solid #222;">
              🧬 Upload New Labs
            </a>
          </div>

          <!-- Referral section -->
          <div style="background:#0f0f0f;border:1px solid #1e1e1e;border-radius:10px;padding:20px;margin-bottom:16px;">
            <p style="margin:0 0 6px;font-size:15px;font-weight:700;color:#fff;">🔗 Refer a Friend, Earn Credit</p>
            <p style="margin:0 0 16px;font-size:13px;color:#888;">
              Know someone who should optimize their biology? Send them your link — every new subscriber gets you account credit.
            </p>
            <div style="background:#1a1a1a;border-radius:6px;padding:10px 14px;font-family:monospace;font-size:13px;color:#DC2626;margin-bottom:12px;word-break:break-all;">
              ${referralUrl}
            </div>
            ${btn(referralUrl, "Share Your Link →")}
          </div>
        </div>
        ${footer()}
      </div>
    `,
  });

  if (error) console.error("Weekly report email error:", error);
}

// ─────────────────────────────────────────────
// 4. WIN-BACK EMAIL (cancelled subscription)
// ─────────────────────────────────────────────
export async function sendWinbackEmail(to: string, name: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;

  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: `${name || "Hey"}, your biology doesn't wait 🧬`,
    html: `
      <div style="${BASE_STYLE}">
        ${header()}
        <div style="padding:32px;">
          <h1 style="font-size:22px;font-weight:700;margin:0 0 12px;">We miss you, ${name || "Optimizer"} 👋</h1>
          <p style="color:#888;line-height:1.7;margin:0 0 24px;">
            Your Human Upgrade OS subscription was cancelled. Your protocol data is still saved — you can pick up right where you left off.
          </p>

          <!-- What they're missing -->
          <div style="margin-bottom:24px;">
            <p style="font-size:13px;font-weight:600;color:#555;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 12px;">What you're missing</p>
            ${[
              ["🧬", "Your personalized Peptide & GLP-1 protocol"],
              ["⏱️", "Performance Age™ tracking over time"],
              ["💊", "Supplement & hormone optimization plan"],
              ["📈", "Weekly upgrade reports & progress insights"],
            ].map(([icon, text]) => `
              <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #1a1a1a;">
                <span style="font-size:18px;">${icon}</span>
                <span style="font-size:14px;color:#ccc;">${text}</span>
              </div>
            `).join("")}
          </div>

          <div style="text-align:center;margin-bottom:28px;">
            ${btn(`${APP_URL}/pricing`, "Reactivate My Protocol →")}
          </div>

          <div style="background:#111;border:1px solid #DC2626/20;border-radius:10px;padding:16px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;color:#DC2626;font-weight:600;">Limited Beta Pricing</p>
            <p style="margin:0;font-size:13px;color:#888;">
              Beta access is still available at <strong style="color:#fff;">$1/month</strong> — but only for the first 50 users. Don't lose your spot.
            </p>
          </div>
        </div>
        ${footer()}
      </div>
    `,
  });

  if (error) console.error("Winback email error:", error);
}
