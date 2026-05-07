import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM || "Human Upgrade <noreply@updates.apexeraapp.com>";
const APP_URL = process.env.APP_URL || "https://humanupgrade.app";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: "Welcome to Human Upgrade OS",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#f5f5f5;padding:40px 32px;border-radius:12px;border:1px solid #222;">
        <div style="margin-bottom:32px;">
          <span style="font-size:22px;font-weight:700;color:#fff;">Human Upgrade <span style="color:#DC2626;">OS</span></span>
        </div>
        <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;">Welcome, ${name || "Optimizer"} 👋</h1>
        <p style="color:#aaa;line-height:1.7;margin-bottom:24px;">
          You're now part of the next evolution in personal health optimization. Upload your first blood panel and let Human Upgrade OS build your personalized protocol.
        </p>
        <a href="${APP_URL}/dashboard" style="display:inline-block;background:#DC2626;color:#fff;padding:12px 28px;border-radius:8px;font-weight:600;text-decoration:none;margin-bottom:32px;">
          Go to Dashboard →
        </a>
        <p style="color:#555;font-size:13px;">
          If you didn't create this account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
  if (error) console.error("Welcome email error:", error);
}

export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  const { error } = await getResend().emails.send({
    from: FROM,
    to,
    subject: "Reset your Human Upgrade OS password",
    html: `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#f5f5f5;padding:40px 32px;border-radius:12px;border:1px solid #222;">
        <div style="margin-bottom:32px;">
          <span style="font-size:22px;font-weight:700;color:#fff;">Human Upgrade <span style="color:#DC2626;">OS</span></span>
        </div>
        <h1 style="font-size:24px;font-weight:700;margin-bottom:12px;">Reset your password</h1>
        <p style="color:#aaa;line-height:1.7;margin-bottom:24px;">
          We received a request to reset your password. This link expires in <strong style="color:#fff;">1 hour</strong>.
        </p>
        <a href="${resetUrl}" style="display:inline-block;background:#DC2626;color:#fff;padding:12px 28px;border-radius:8px;font-weight:600;text-decoration:none;margin-bottom:32px;">
          Reset Password →
        </a>
        <p style="color:#555;font-size:13px;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not change.
        </p>
      </div>
    `,
  });
  if (error) console.error("Password reset email error:", error);
}
