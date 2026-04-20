"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard } from "../../components/AuthCard";
import { setToken } from "../../services/auth";
import { signup } from "../../services/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");
      const response = await signup(email, password);
      setToken(response.token);
      router.push("/");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Signup failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Create your workspace and start turning long-form videos into reusable marketing assets."
      footerText="Already have an account?"
      footerLinkLabel="Sign in"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-sky-50">Email</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/30 bg-white/95 px-4 py-3 text-slate-900 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-sky-50">Password</label>
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
          disabled={isLoading}
          className="w-full rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white disabled:bg-rose-300"
        >
          {isLoading ? "Creating account..." : "Register"}
        </button>
      </form>

      {error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </AuthCard>
  );
}
