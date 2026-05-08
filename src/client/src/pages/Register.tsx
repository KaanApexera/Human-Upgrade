import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { RegisterForm } from "@/components/AuthForms";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Register() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [error, setError] = useState("");

  const planFromUrl = new URLSearchParams(search).get("plan");

  const registerMutation = useMutation({
    mutationFn: async (data: { name: string; email: string; password: string }) => {
      const response = await apiRequest("POST", "/api/register", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      // If coming from a plan selection, redirect to pricing to complete checkout
      if (planFromUrl) {
        setLocation(`/pricing?plan=${planFromUrl}`);
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (err: any) => {
      setError(err.message || "Registration failed. Please try again.");
    },
  });

  const handleRegister = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    setError("");
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });
    } catch (err: any) {
      // Error is already handled by onError callback
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <RegisterForm
      onRegister={handleRegister}
      onGoogleAuth={handleGoogleAuth}
      isLoading={registerMutation.isPending}
      error={error}
    />
  );
}
