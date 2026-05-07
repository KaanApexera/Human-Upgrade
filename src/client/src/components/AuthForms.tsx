import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Link } from "wouter";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { SiGoogle } from "react-icons/si";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
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

export function LoginForm({ onLogin, onGoogleAuth, isLoading, error }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleSubmit = async (data: LoginFormData) => {
    await onLogin?.(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md bg-card border-card-border">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Link href="/"><Logo size="lg" /></Link>
          </div>
          <div>
            <CardTitle className="font-heading text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to access your health dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 bg-background border-border"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-background border-border"
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-red hover:bg-brand-red/90 rounded-full font-semibold"
                data-testid="button-login"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <Separator className="bg-border" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or continue with
              </span>
            </div>

            <Button
              variant="outline"
              onClick={onGoogleAuth}
              className="w-full mt-4 border-border hover:bg-muted"
              data-testid="button-google-login"
            >
              <SiGoogle className="w-4 h-4 mr-2" />
              Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-center text-sm">
          <a href="/forgot-password" className="text-brand-red hover:underline" data-testid="link-forgot-password">
            Forgot your password?
          </a>
          <p className="text-muted-foreground">
            Don't have an account?{" "}
            <a href="/register" className="text-brand-red hover:underline" data-testid="link-register">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export function RegisterForm({ onRegister, onGoogleAuth, isLoading, error }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const handleSubmit = async (data: RegisterFormData) => {
    await onRegister?.(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md bg-card border-card-border">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Link href="/"><Logo size="lg" /></Link>
          </div>
          <div>
            <CardTitle className="font-heading text-2xl">Create Account</CardTitle>
            <CardDescription className="text-muted-foreground">
              Start optimizing your health today
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="John Doe"
                          className="pl-10 bg-background border-border"
                          data-testid="input-name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="you@example.com"
                          className="pl-10 bg-background border-border"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10 bg-background border-border"
                          data-testid="input-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••"
                          className="pl-10 bg-background border-border"
                          data-testid="input-confirm-password"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  id="medical-consent"
                  required
                  className="mt-0.5 accent-red-600 cursor-pointer"
                  data-testid="checkbox-medical-consent"
                />
                <label htmlFor="medical-consent" className="cursor-pointer leading-relaxed">
                  I understand that Human Upgrade OS is <strong className="text-foreground">not a medical device</strong> and does not provide medical advice. I agree to the{" "}
                  <a href="/terms" target="_blank" className="text-brand-red hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" target="_blank" className="text-brand-red hover:underline">Privacy Policy</a>.
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-red hover:bg-brand-red/90 rounded-full font-semibold"
                data-testid="button-register"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6">
            <div className="relative">
              <Separator className="bg-border" />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                or continue with
              </span>
            </div>

            <Button
              variant="outline"
              onClick={onGoogleAuth}
              className="w-full mt-4 border-border hover:bg-muted"
              data-testid="button-google-register"
            >
              <SiGoogle className="w-4 h-4 mr-2" />
              Google
            </Button>
          </div>
        </CardContent>

        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground w-full">
            Already have an account?{" "}
            <a href="/login" className="text-brand-red hover:underline" data-testid="link-login">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card border-card-border">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Link href="/"><Logo size="lg" /></Link>
          </div>
          <div>
            <CardTitle className="font-heading text-2xl">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              {submitted
                ? "Check your email for reset instructions"
                : "Enter your email to receive reset instructions"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {!submitted ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="email"
                            placeholder="you@example.com"
                            className="pl-10 bg-background border-border"
                            data-testid="input-email"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-red hover:bg-brand-red/90 rounded-full font-semibold"
                  data-testid="button-reset-password"
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </Form>
          ) : (
            <div className="text-center py-4">
              <Mail className="w-12 h-12 text-brand-red mx-auto mb-4" />
              <p className="text-foreground">
                We've sent a password reset link to your email.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="text-center text-sm">
          <p className="text-muted-foreground w-full">
            Remember your password?{" "}
            <a href="/login" className="text-brand-red hover:underline" data-testid="link-login">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
