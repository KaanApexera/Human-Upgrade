import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { LoginForm } from "@/components/AuthForms";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Login() {
  const [, setLocation] = useLocation();
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/dashboard");
    },
    onError: (err: any) => {
      setError(err.message || "Invalid email or password");
    },
  });

  const handleLogin = async (data: { email: string; password: string }) => {
    setError("");
    try {
      await loginMutation.mutateAsync(data);
    } catch (err: any) {
      // Error is already handled by onError callback
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <LoginForm
      onLogin={handleLogin}
      onGoogleAuth={handleGoogleAuth}
      isLoading={loginMutation.isPending}
      error={error}
    />
  );
}
