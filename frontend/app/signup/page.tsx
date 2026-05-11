"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AuthCard } from "../../components/AuthCard";
import { setToken } from "../../services/auth";
import { resendVerification, signup, verifyEmail } from "../../services/api";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerificationStep, setIsVerificationStep] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");
      setNotice("");
      const response = await signup(email, password);
      if (response.token) {
        setToken(response.token);
        router.push("/");
        return;
      }

      setIsVerificationStep(true);
      setNotice(response.message || "Check your email for the 6-digit code.");
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Signup failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError("");
      setNotice("");
      const response = await verifyEmail(email, code);
      setToken(response.token);
      router.push("/");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Verification failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await resendVerification(email);
      setNotice(response.message || "A new verification code has been sent.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to resend code."
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
      {!isVerificationStep ? (
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
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="rounded-xl border border-cyan-200/40 bg-white/10 px-4 py-3 text-sm leading-7 text-sky-50">
            Enter the 6-digit code sent to {email}.
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-sky-50">Verification code</label>
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="123456"
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
              className="w-full rounded-xl border border-white/30 bg-white/95 px-4 py-3 text-slate-900 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || code.length !== 6}
            className="w-full rounded-xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white disabled:bg-rose-300"
          >
            {isLoading ? "Verifying..." : "Verify email"}
          </button>
          <button
            type="button"
            onClick={handleResendCode}
            disabled={isLoading}
            className="w-full rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            Resend code
          </button>
        </form>
      )}

      {notice ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
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
