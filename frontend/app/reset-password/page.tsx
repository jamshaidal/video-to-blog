"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AuthCard } from "../../components/AuthCard";
import { resetPassword } from "../../services/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "");
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");
      setMessage("");
      const response = await resetPassword(token, password);
      setMessage(response.message || "Password reset successfully.");
      window.setTimeout(() => router.push("/login"), 1500);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to reset password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="New Password"
      subtitle="Create a new password for your MotionCraftAI account."
      footerText="Already reset it?"
      footerLinkLabel="Sign in"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!token ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Reset token is missing. Request a new password reset link.
          </div>
        ) : null}
        <div className="space-y-2">
          <label className="text-sm font-medium text-sky-50">New password</label>
          <input
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-white/30 bg-white/95 px-4 py-3 text-slate-900 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-500"
        >
          {isLoading ? "Resetting..." : "Reset password"}
        </button>
      </form>

      {message ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </AuthCard>
  );
}
