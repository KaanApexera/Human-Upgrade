import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Logo } from "@/components/Logo";
import { Link } from "wouter";
import { CheckCircle2, AlertCircle, Lock, Eye, EyeOff, Activity, Dna, Zap } from "lucide-react";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const BULLETS = [
  { icon: <Activity className="w-3.5 h-3.5" />, text: "Performance Age™ from your blood work" },
  { icon: <Dna className="w-3.5 h-3.5" />, text: "Personalized peptide & supplement stack" },
  { icon: <Zap className="w-3.5 h-3.5" />, text: "Day-by-day optimization protocol" },
];

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) setServerError("Invalid or missing reset token. Please request a new link.");
    else setToken(t);
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/reset-password", { token, password: data.password });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Reset failed");
      }
      return res.json();
    },
    onSuccess: () => setDone(true),
    onError: (err: any) => setServerError(err.message || "Reset failed"),
  });

  return (
    <div className="flex min-h-screen">
      {/* ── LEFT panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        <img
          src="https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1200&q=85&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10">
          <Link href="/"><Logo size="md" /></Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-bold text-white leading-tight">Your Biology{"\n"}Doesn't Lie.</h2>
            <p className="mt-3 text-white/60 text-base leading-relaxed">
              Precision health optimization powered by your actual lab data — not generic advice.
            </p>
          </div>
          <div className="space-y-3">
            {BULLETS.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-400">
                  {b.icon}
                </div>
                <span className="text-white/70 text-sm">{b.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Beta — First 50 users · $1/month
          </div>
        </div>
      </div>

      {/* ── RIGHT panel ── */}
      <div className="flex-1 lg:w-1/2 bg-[#080808] flex flex-col items-center justify-center p-6 sm:p-10 min-h-screen relative">
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Link href="/"><Logo size="lg" /></Link>
          </div>

          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Password reset!</h2>
              <p className="text-white/50 text-sm">Your password has been updated successfully.</p>
              <Button className="w-full bg-red-600 hover:bg-red-500 rounded-full font-semibold text-white mt-4" onClick={() => setLocation("/login")}>
                Sign in
              </Button>
            </div>
          ) : serverError && !token ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Invalid link</h2>
              <p className="text-white/50 text-sm">{serverError}</p>
              <Button variant="outline" className="w-full border-white/10 bg-white/5 text-white hover:bg-white/10 mt-4" onClick={() => setLocation("/forgot-password")}>
                Request new link
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Set new password</h1>
                <p className="text-white/50 text-sm mt-1">Choose a strong password for your account</p>
              </div>

              <Form {...({ control } as any)}>
                <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
                  <FormField
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70 text-sm">New password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Min. 8 characters"
                              className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70 text-sm">Confirm password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <Input {...field} type="password" placeholder="••••••••" className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-red-500/50" />
                          </div>
                        </FormControl>
                        {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
                      </FormItem>
                    )}
                  />

                  {serverError && <p className="text-sm text-red-400 text-center">{serverError}</p>}

                  <Button type="submit" disabled={mutation.isPending} className="w-full bg-red-600 hover:bg-red-500 rounded-full font-semibold text-white">
                    {mutation.isPending ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>
              </Form>

              <p className="text-center text-sm text-white/40 mt-6">
                <a href="/login" className="text-red-400 hover:text-red-300">Back to sign in</a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
