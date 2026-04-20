import Link from "next/link";
import { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  subtitle: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkHref: string;
  children: ReactNode;
};

export function AuthCard({
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkHref,
  children,
}: AuthCardProps) {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#0f6ad8_0%,#0d4f9d_35%,#0b336d_100%)] px-5 py-10 text-white sm:px-8">
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-center justify-center rounded-[2rem] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 shadow-[0_40px_100px_rgba(3,7,18,0.35)] backdrop-blur">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
          <div className="absolute left-[-6rem] top-32 h-40 w-40 rounded-[3rem] bg-[linear-gradient(180deg,rgba(147,197,253,0.7),rgba(59,130,246,0.2))] blur-0" />
          <div className="absolute bottom-[-4rem] left-32 h-52 w-52 rounded-full border-[18px] border-sky-300/60 blur-sm" />
          <div className="absolute right-20 top-20 h-64 w-64 rounded-full border-[18px] border-cyan-400/40 blur-sm" />
          <div className="absolute right-10 top-40 h-72 w-24 rounded-full bg-[linear-gradient(180deg,rgba(14,116,217,0.05),rgba(14,116,217,0.65),rgba(14,116,217,0.05))] blur-md" />
          <div className="absolute bottom-10 right-24 h-16 w-40 rounded-full bg-[linear-gradient(90deg,rgba(125,211,252,0.7),rgba(96,165,250,0.35))] blur-sm" />
        </div>

        <div className="relative grid w-full max-w-5xl gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden items-center justify-center lg:flex">
            <div className="space-y-6">
              <div className="h-20 w-40 rounded-[2rem] bg-[linear-gradient(145deg,rgba(191,219,254,0.96),rgba(96,165,250,0.92))] shadow-[0_18px_40px_rgba(2,8,23,0.25)]" />
              <div className="h-16 w-24 rounded-[1.5rem] bg-[linear-gradient(145deg,rgba(191,219,254,0.94),rgba(96,165,250,0.85))] shadow-[0_18px_40px_rgba(2,8,23,0.25)]" />
            </div>
          </div>

          <section className="mx-auto w-full max-w-md rounded-[2rem] border border-white/30 bg-white/12 px-8 py-10 shadow-[0_25px_80px_rgba(15,23,42,0.25)] backdrop-blur-xl">
            <p className="text-center text-3xl font-semibold tracking-tight">
              MotionCraft<span className="text-cyan-200">AI</span>
            </p>
            <h1 className="mt-8 text-4xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-3 text-sm leading-7 text-sky-100">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <p className="mt-8 text-center text-sm text-sky-100">
              {footerText}{" "}
              <Link href={footerLinkHref} className="font-semibold text-white">
                {footerLinkLabel}
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
