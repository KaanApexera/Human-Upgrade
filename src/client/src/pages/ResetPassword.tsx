import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { CheckCircle2, AlertCircle } from "lucide-react";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) setServerError("Invalid or missing reset token. Please request a new password reset.");
    else setToken(t);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Set new password</CardTitle>
            <CardDescription>Choose a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-sm text-muted-foreground">Your password has been reset successfully.</p>
                <Button className="w-full" onClick={() => setLocation("/login")}>Sign in</Button>
              </div>
            ) : serverError && !token ? (
              <div className="flex flex-col items-center gap-4 py-4 text-center">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="text-sm text-muted-foreground">{serverError}</p>
                <Button variant="outline" className="w-full" onClick={() => setLocation("/forgot-password")}>
                  Request new link
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
                {serverError && (
                  <p className="text-sm text-destructive">{serverError}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" type="password" {...register("password")} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Resetting..." : "Reset password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
