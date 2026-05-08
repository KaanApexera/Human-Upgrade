import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Link } from "wouter";
import { Eye, EyeOff, Mail, Lock, User, Check, Activity, Dna, Zap } from "lucide-react";
import { SiGoogle } from "react-icons/si";

/* ── schemas ── */
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface AuthFormProps {
  onLogin?: (data: LoginFormData) => Promise<void>;
  onRegister?: (data: RegisterFormData) => Promise<void>;
  onForgotPassword?: (data: ForgotPasswordFormData) => Promise<void>;
  onGoogleAuth?: () => void;
  isLoading?: boolean;
  error?: string;
}

/* ── shared left panel ── */
interface LeftPanelProps {
  image: string;
  tagline: string;
  sub: string;
  bullets: { icon: React.ReactNode; text: string }[];
}

function LeftPanel({ image, tagline, sub, bullets }: LeftPanelProps) {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
      {/* background image */}
      <img
        src={image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      {/* gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      {/* red accent glow */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      {/* top logo */}
      <div className="relative z-10">
        <Link href="/">
          <Logo size="md" />
        </Link>
      </div>

      {/* center content */}
      <div className="relative z-10 space-y-6">
        <div>
          <h2 className="text-4xl font-bold text-white leading-tight">{tagline}</h2>
          <p className="mt-3 text-white/60 text-base leading-relaxed">{sub}</p>
        </div>
        <div className="space-y-3">
          {bullets.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 w-3.5 h-3.5">{b.icon}</span>
              </div>
              <span className="text-white/70 text-sm">{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* bottom badge */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          Beta — First 50 users · $1/month
        </div>
      </div>
    </div>
  );
}

/* ── shared right panel wrapper ── */
function RightPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 lg:w-1/2 bg-[#080808] flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen relative">
      {/* subtle top-right controls */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      {/* faint red glow top right */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}

/* ─────────── LOGIN ─────────── */
export function LoginForm({ onLogin, onGoogleAuth, isLoading, error }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="flex min-h-screen">
      <LeftPanel
        image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=85&fit=crop&crop=top"
        tagline={"Know Your Body.\nOutlive Everyone."}
        sub="Upload your labs. Get your biological age, peptide stack, and the exact steps to optimize your performance."
        bullets={[
          { icon: <Activity className="w-3.5 h-3.5" />, text: "Performance Age™ from your blood work" },
          { icon: <Dna className="w-3.5 h-3.5" />, text: "Personalized peptide & supplement stack" },
          { icon: <Zap className="w-3.5 h-3.5" />, text: "Day-by-day optimization protocol" },
        ]}
      />

      <RightPanel>
        {/* Mobile logo */}
        <div className="flex justify-center mb-8 lg:hidden">
          <Link href="/"><Logo size="lg" /></Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to your dashboard</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => onLogin?.(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70 text-sm">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20"
                        data-testid="input-email"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70 text-sm">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50 focus:ring-red-500/20"
                        data-testid="input-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div className="flex justify-end">
              <a href="/forgot-password" className="text-xs text-red-400 hover:text-red-300" data-testid="link-forgot-password">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-500 rounded-full font-semibold text-white"
              data-testid="button-login"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Button
          variant="outline"
          onClick={onGoogleAuth}
          className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          data-testid="button-google-login"
        >
          <SiGoogle className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-white/40 mt-6">
          No account?{" "}
          <a href="/register" className="text-red-400 hover:text-red-300" data-testid="link-register">
            Sign up free
          </a>
        </p>
      </RightPanel>
    </div>
  );
}

/* ─────────── REGISTER ─────────── */
export function RegisterForm({ onRegister, onGoogleAuth, isLoading, error }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  return (
    <div className="flex min-h-screen">
      <LeftPanel
        image="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=85&fit=crop&crop=center"
        tagline={"Upgrade Your\nBiology Today."}
        sub="Join the first 50 beta users getting full Pro access at $1/month. Your personalized protocol starts with one blood test."
        bullets={[
          { icon: <Check className="w-3.5 h-3.5" />, text: "Upload any standard blood panel" },
          { icon: <Check className="w-3.5 h-3.5" />, text: "AI extracts 50+ biomarkers automatically" },
          { icon: <Check className="w-3.5 h-3.5" />, text: "Get your full protocol in minutes" },
        ]}
      />

      <RightPanel>
        <div className="flex justify-center mb-8 lg:hidden">
          <Link href="/"><Logo size="lg" /></Link>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Create account</h1>
          <p className="text-white/50 text-sm mt-1">Start optimizing your health today</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => onRegister?.(d))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70 text-sm">Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input {...field} placeholder="John Doe" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50" data-testid="input-name" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70 text-sm">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input {...field} type="email" placeholder="you@example.com" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50" data-testid="input-email" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70 text-sm">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input
                        {...field}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50"
                        data-testid="input-password"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/70 text-sm">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <Input {...field} type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50" data-testid="input-confirm-password" />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )}
            />

            {error && <p className="text-sm text-red-400 text-center">{error}</p>}

            <div className="flex items-start gap-2 text-xs text-white/40">
              <input type="checkbox" id="medical-consent" required className="mt-0.5 accent-red-600 cursor-pointer" data-testid="checkbox-medical-consent" />
              <label htmlFor="medical-consent" className="cursor-pointer leading-relaxed">
                I understand Human Upgrade OS is <strong className="text-white/60">not a medical device</strong>. I agree to the{" "}
                <a href="/terms" target="_blank" className="text-red-400 hover:underline">Terms</a> and{" "}
                <a href="/privacy" target="_blank" className="text-red-400 hover:underline">Privacy Policy</a>.
              </label>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-500 rounded-full font-semibold text-white" data-testid="button-register">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Form>

        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Button variant="outline" onClick={onGoogleAuth} className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white" data-testid="button-google-register">
          <SiGoogle className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-red-400 hover:text-red-300" data-testid="link-login">Sign in</a>
        </p>
      </RightPanel>
    </div>
  );
}

/* ─────────── FORGOT PASSWORD ─────────── */
export function ForgotPasswordForm({ onForgotPassword, isLoading, error }: AuthFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    await onForgotPassword?.(data);
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen">
      <LeftPanel
        image="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&q=85&fit=crop"
        tagline={"Your Biology\nDoesn't Lie."}
        sub="Precision health optimization powered by your actual lab data — not generic advice."
        bullets={[
          { icon: <Dna className="w-3.5 h-3.5" />, text: "50+ biomarkers analyzed per upload" },
          { icon: <Activity className="w-3.5 h-3.5" />, text: "Biological age calculated from your blood" },
          { icon: <Zap className="w-3.5 h-3.5" />, text: "Protocol updates as your biology improves" },
        ]}
      />

      <RightPanel>
        <div className="flex justify-center mb-8 lg:hidden">
          <Link href="/"><Logo size="lg" /></Link>
        </div>

        {!submitted ? (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white">Reset password</h1>
              <p className="text-white/50 text-sm mt-1">Enter your email and we'll send a reset link</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-sm">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                          <Input {...field} type="email" placeholder="you@example.com" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50" data-testid="input-email" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                {error && <p className="text-sm text-red-400 text-center">{error}</p>}

                <Button type="submit" disabled={isLoading} className="w-full bg-red-600 hover:bg-red-500 rounded-full font-semibold text-white" data-testid="button-reset-password">
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Check your email</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              We've sent a password reset link to your email. It may take a minute to arrive.
            </p>
          </div>
        )}

        <p className="text-center text-sm text-white/40 mt-8">
          Remember your password?{" "}
          <a href="/login" className="text-red-400 hover:text-red-300" data-testid="link-login">Sign in</a>
        </p>
      </RightPanel>
    </div>
  );
}
