import Link from "next/link";
import { siteConfig } from "../services/siteConfig";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-white/80 px-5 py-10 backdrop-blur sm:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <p className="text-lg font-semibold text-slate-950">
            MotionCraft<span className="text-rose-500">AI</span>
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {siteConfig.brandTagline}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
            Transform videos into transcripts, blog posts, captions, and polished downloadable
            content with a client-ready AI workflow for creators, agencies, and teams.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Product
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <Link href="/">Landing</Link>
            <Link href="/pricing">Services</Link>
            <Link href="/jobs">Workspace</Link>
            <Link href="/signup">Get Started</Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Service
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <span>AI content repurposing</span>
            <span>Manual long-video support</span>
            <span>PDF and TXT exports</span>
            <a href={siteConfig.whatsappLink} target="_blank" rel="noreferrer">
              WhatsApp contact
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Trust
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <span>Authenticated workspace</span>
            <span>Queued background processing</span>
            <span>Usage guardrails for cost control</span>
            <span>Private downloadable outputs</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
