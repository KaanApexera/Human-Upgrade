import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ForgotPasswordForm } from "@/components/AuthForms";
import { apiRequest } from "@/lib/queryClient";

export default function ForgotPassword() {
  const [error, setError] = useState("");

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiRequest("POST", "/api/forgot-password", data);
      return response.json();
    },
    onError: (err: any) => {
      setError(err.message || "Failed to send reset email");
    },
  });

  const handleForgotPassword = async (data: { email: string }) => {
    setError("");
    forgotPasswordMutation.mutate(data);
  };

  return (
    <ForgotPasswordForm
      onForgotPassword={handleForgotPassword}
      isLoading={forgotPasswordMutation.isPending}
      error={error}
    />
  );
}
