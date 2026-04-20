"use client";

import Link from "next/link";
import { useState } from "react";
import { clearToken, getToken } from "../services/auth";
import { siteConfig } from "../services/siteConfig";

export function TopNav() {
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()));

  return (
    <header className="sticky top-0 z-40 px-5 pt-5 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-full border border-white/70 bg-white/78 px-5 py-3 shadow-[0_10px_40px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">
            MotionCraft<span className="text-rose-500">AI</span>
          </Link>
          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 lg:inline-flex">
            {siteConfig.brandTagline}
          </span>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/">Home</Link>
          <Link href="/pricing">Services</Link>
          <Link href="/pricing#custom-service">Custom Projects</Link>
          <Link href="/jobs">Workspace</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={siteConfig.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 lg:inline-flex"
          >
            {siteConfig.supportLabel}
          </a>
          {hasToken ? (
            <>
              <Link
                href="/jobs"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  clearToken();
                  setHasToken(false);
                  window.location.href = "/";
                }}
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(244,63,94,0.2)]"
              >
                Start Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
