import Link from "next/link";
import { SiteFooter } from "../../components/SiteFooter";
import { TopNav } from "../../components/TopNav";
import { siteConfig } from "../../services/siteConfig";

const serviceTiers = [
  {
    name: "Self-Serve",
    price: `Up to ${siteConfig.selfServeMaxMinutes} min`,
    points: [
      `${siteConfig.selfServeDailyVideos} video conversions per day per user`,
      "Transcript, blog, YouTube description, captions",
      "Cloud-hosted downloads plus TXT and PDF export",
    ],
  },
  {
    name: "Manual Assist",
    price: "$1 per 10 min",
    points: [
      "Best for 10 to 30 minute videos",
      "Handled with direct WhatsApp coordination",
      "Useful when you need help beyond the self-serve queue",
    ],
    highlight: true,
  },
  {
    name: "Custom Project",
    price: "Custom quote",
    points: [
      "Best for 30 to 60 minute videos",
      "AI cleanup, editing requests, and client delivery",
      "Ideal for agencies, interviews, webinars, and bulk work",
    ],
  },
];

const manualPricing = [
  "10 minutes = $1",
  "20 minutes = $2",
  "30 minutes = $3",
  "More than 30 minutes = custom quote",
];

const premiumOutputs = [
  "Chapters with timestamps",
  "Subtitle exports in SRT, VTT, and TXT",
  "Transcript, blog, YouTube description, and caption pack",
  "Manual long-video handling through WhatsApp coordination",
];

const comparisonRows = [
  {
    label: "Best for",
    values: [
      "Short repurposing jobs",
      "Longer single videos",
      "Agency or delivery-heavy work",
    ],
  },
  {
    label: "Turnaround",
    values: [
      "Queue-based self-serve",
      "Handled after confirmation",
      "Scoped around your brief",
    ],
  },
  {
    label: "Outputs",
    values: [
      "Transcript, blog, captions, PDF/TXT",
      "Everything in self-serve plus manual support",
      "Flexible delivery, edits, and packaging",
    ],
  },
  {
    label: "Support path",
    values: [
      "Inside your workspace",
      "WhatsApp coordination",
      "WhatsApp plus custom scope",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7fb,#ffffff)] text-slate-900">
      <TopNav />
      <section className="px-5 pb-14 pt-8 sm:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">
              Service Options
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
              Self-serve for short videos, direct support for bigger work.
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Keep your OpenAI usage under control with a hard self-serve cap, then move larger videos or editing-heavy jobs into a manual WhatsApp-assisted flow.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {serviceTiers.map((tier) => (
              <article
                key={tier.name}
                className={`rounded-[2rem] border p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ${
                  tier.highlight
                    ? "border-emerald-300 bg-[linear-gradient(180deg,#ecfdf5,#ffffff)]"
                    : "border-slate-200/80 bg-white"
                }`}
              >
                {tier.highlight ? (
                  <p className="mb-4 inline-flex rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
                    Best for longer videos
                  </p>
                ) : null}
                <h2 className="text-3xl font-semibold tracking-tight">{tier.name}</h2>
                <p className="mt-4 text-4xl font-semibold tracking-tight">{tier.price}</p>
                <div className="mt-6 grid gap-3">
                  {tier.points.map((point) => (
                    <div key={point} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      {point}
                    </div>
                  ))}
                </div>
                <a
                  href={tier.name === "Self-Serve" ? "/signup" : siteConfig.whatsappLink}
                  target={tier.name === "Self-Serve" ? undefined : "_blank"}
                  rel={tier.name === "Self-Serve" ? undefined : "noreferrer"}
                  className={`mt-8 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                    tier.highlight
                      ? "bg-emerald-500 text-white"
                      : "border border-slate-200 text-slate-900"
                  }`}
                >
                  {tier.name === "Self-Serve" ? "Use self-serve" : "Contact on WhatsApp"}
                </a>
              </article>
            ))}
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            <section className="rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Self-serve rules
              </p>
              <div className="mt-6 grid gap-3">
                {[
                  `Maximum video duration: ${siteConfig.selfServeMaxMinutes} minutes`,
                  `Maximum usage: ${siteConfig.selfServeDailyVideos} videos per day per user`,
                  "Video-only uploads",
                  "Best for short-form repurposing and quick content extraction",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section
              id="custom-service"
              className="rounded-[2rem] border border-emerald-200 bg-[linear-gradient(180deg,#ecfdf5,#ffffff)] p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Custom service
              </p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                Send us bigger videos and we handle the work for you.
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                This path is for longer source files, AI-assisted editing, extra cleanup, or client-ready delivery. You confirm the job over WhatsApp and we process it outside the self-serve cap.
              </p>
              <div className="mt-6 grid gap-3">
                {manualPricing.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/80 bg-white/90 px-4 py-4 text-sm font-semibold text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
              <a
                href={siteConfig.whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-8 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
              >
                Start on WhatsApp
              </a>
            </section>
          </div>

          <section className="mt-16 rounded-[2rem] border border-slate-200/80 bg-white/92 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Compare paths
              </p>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                Pick the path that matches your video and delivery needs.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Self-serve is optimized for speed and guardrails. Manual Assist and
                Custom Projects exist for bigger files, editing-heavy requests, and
                client delivery.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div className="grid grid-cols-[0.9fr_1fr_1fr_1fr] bg-slate-950 text-white">
                <div className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                  Feature
                </div>
                {serviceTiers.map((tier) => (
                  <div
                    key={tier.name}
                    className="px-4 py-4 text-sm font-semibold uppercase tracking-[0.18em]"
                  >
                    {tier.name}
                  </div>
                ))}
              </div>
              {comparisonRows.map((row, rowIndex) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-[0.9fr_1fr_1fr_1fr] ${
                    rowIndex % 2 === 0 ? "bg-white" : "bg-slate-50"
                  }`}
                >
                  <div className="border-t border-slate-200 px-4 py-4 text-sm font-semibold text-slate-900">
                    {row.label}
                  </div>
                  {row.values.map((value) => (
                    <div
                      key={value}
                      className="border-t border-slate-200 px-4 py-4 text-sm leading-7 text-slate-600"
                    >
                      {value}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Manual media services
                </p>
                <h2 className="mt-5 text-4xl font-semibold tracking-tight">
                  Editing, extraction, subtitles, and custom exports.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  These requests are confirmed on WhatsApp before payment because the time depends on file length, quality, and delivery format.
                </p>
                <a
                  href={siteConfig.whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
                >
                  Ask for a quote
                </a>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {siteConfig.mediaServices.map((service) => (
                  <article
                    key={service.title}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-5"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                      {service.delivery}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {service.summary}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,#fff1f5,#fff9f4)] p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
                  Next upgrade path
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight">
                  AI video copilot and editing tools can be layered on next.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  Once your service model is stable, the next high-value features are subtitle export, chapters, clip suggestions, silence removal, and an AI copilot that helps users shape content from each uploaded video.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  "Chapters + timestamps",
                  "SRT/VTT export",
                  "Clip suggestions",
                  "Silence cleanup",
                  "AI copilot chat",
                ].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-16 rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
            <div className="mx-auto max-w-3xl text-center">
              <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Premium outputs
              </p>
              <h2 className="mt-5 text-4xl font-semibold tracking-tight">
                Professional deliverables clients actually use.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {premiumOutputs.map((item) => (
                <div
                  key={item}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-5 text-sm font-semibold text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900"
            >
              Back to homepage
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
