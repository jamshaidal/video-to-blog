"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard } from "../../components/AuthCard";
import { setToken } from "../../services/auth";
import { login } from "../../services/api";

export default function LoginPage() {
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
      const response = await login(email, password);
      setToken(response.token);
      router.push("/");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Login failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Login"
      subtitle="Sign in to manage queued jobs, review generated content, and export your assets."
      footerText="Don't have an account yet?"
      footerLinkLabel="Register for free"
      footerLinkHref="/signup"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-sky-50">Email</label>
          <input
            type="email"
            placeholder="username@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-white/30 bg-white/95 px-4 py-3 text-slate-900 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-sky-50">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-white/30 bg-white/95 px-4 py-3 text-slate-900 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-500"
        >
          {isLoading ? "Signing in..." : "Sign in"}
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
