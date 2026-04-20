"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { SiteFooter } from "../components/SiteFooter";
import { StatusBadge } from "../components/StatusBadge";
import { TopNav } from "../components/TopNav";
import { clearToken, getToken } from "../services/auth";
import { getJob, type Job, uploadVideo } from "../services/api";
import {
  formatDuration,
  formatFileSize,
  getJobDisplayName,
  getJobStage,
} from "../services/jobPresentation";
import { siteConfig } from "../services/siteConfig";

const featureCards = [
  {
    title: "Reduce production cost",
    body: "Turn one uploaded video into reusable assets without manual rewriting or copy cleanup.",
  },
  {
    title: "Speed up time to value",
    body: "Queue processing in the background and get transcript, blog, descriptions, and captions fast.",
  },
  {
    title: "Drive team output",
    body: "Track jobs, revisit history, and export content bundles for publishing, review, or client delivery.",
  },
];

const serviceOptions = [
  {
    name: "Self-Serve",
    price: `Up to ${siteConfig.selfServeMaxMinutes} min`,
    detail: `${siteConfig.selfServeDailyVideos} videos per day per user`,
  },
  {
    name: "Manual Assist",
    price: "$1 / 10 min",
    detail: "Handled by our team after WhatsApp confirmation",
  },
  {
    name: "Custom Project",
    price: "10-60 min",
    detail: "For longer videos, AI edits, and client-ready delivery",
  },
];

const useCases = [
  {
    title: "Podcast repurposing",
    body: "Turn one episode into show notes, captions, social posts, and a clean transcript for publishing.",
  },
  {
    title: "Agency client delivery",
    body: "Create exportable TXT and PDF bundles your team can hand over to clients without extra formatting.",
  },
  {
    title: "Coach and webinar content",
    body: "Extract clear written assets from training videos, masterclasses, and recorded sessions in one pass.",
  },
];

const faqItems = [
  {
    question: "What does the self-serve workspace include?",
    answer:
      "Transcript, blog post, YouTube description, social captions, cloud file links, and downloadable TXT and PDF exports.",
  },
  {
    question: "How do you protect API usage costs?",
    answer:
      `Self-serve is limited to ${siteConfig.selfServeMaxMinutes} minutes per video and ${siteConfig.selfServeDailyVideos} uploads per user per day.`,
  },
  {
    question: "What if I need a longer video processed?",
    answer:
      "For bigger source files, custom edits, or bulk work, we move the project into a manual WhatsApp-assisted flow outside the self-serve queue.",
  },
];

const deliverables = [
  "Transcript cleanup",
  "Blog article draft",
  "YouTube description",
  "5 social captions",
  "Chapters with timestamps",
  "Subtitle exports: SRT, VTT, TXT",
];

const trustHighlights = [
  {
    label: "Expected turnaround",
    value: siteConfig.averageTurnaround,
  },
  {
    label: "Supported formats",
    value: siteConfig.supportedFormats.join(", "),
  },
  {
    label: "Private workspace",
    value: siteConfig.privateWorkspaceMessage,
  },
  {
    label: "Included outputs",
    value: siteConfig.expectedOutputs.join(", "),
  },
];

const sampleOutputs = [
  {
    title: "Transcript cleanup",
    body: "Speaker-ready transcript with punctuation and cleaner phrasing for internal review or publishing.",
  },
  {
    title: "YouTube packaging",
    body: "Channel description copy that is ready to paste into a publish flow without manual cleanup.",
  },
  {
    title: "Platform captions",
    body: "Multiple caption angles so the same source video can be posted differently across social channels.",
  },
];

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileDuration, setSelectedFileDuration] = useState<number | null>(
    null
  );
  const [job, setJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [hasToken, setHasToken] = useState(() => Boolean(getToken()));
  const pollingRef = useRef<number | null>(null);
  const activeJobName = job ? getJobDisplayName(job) : "";
  const activeJobStage = job ? getJobStage(job) : null;
  const selectedFileSummary = selectedFile
    ? `${formatFileSize(selectedFile.size)} • ${formatDuration(selectedFileDuration)}`
    : null;

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        window.clearInterval(pollingRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFileDuration(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    const video = document.createElement("video");
    video.preload = "metadata";

    const handleLoadedMetadata = () => {
      setSelectedFileDuration(video.duration);
      URL.revokeObjectURL(previewUrl);
    };

    const handleError = () => {
      setSelectedFileDuration(null);
      URL.revokeObjectURL(previewUrl);
    };

    video.onloadedmetadata = handleLoadedMetadata;
    video.onerror = handleError;
    video.src = previewUrl;

    return () => {
      video.onloadedmetadata = null;
      video.onerror = null;
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedFile]);

  const handleLogout = () => {
    clearToken();
    setHasToken(false);
    setJob(null);
  };

  const startPolling = (jobId: string) => {
    if (pollingRef.current) {
      window.clearInterval(pollingRef.current);
    }

    pollingRef.current = window.setInterval(async () => {
      try {
        const nextJob = await getJob(jobId);
        setJob(nextJob);

        if (nextJob.status === "completed" || nextJob.status === "failed") {
          window.clearInterval(pollingRef.current || undefined);
          pollingRef.current = null;
          setIsSubmitting(false);
        }
      } catch {
        setError("Unable to refresh job status right now.");
        setIsSubmitting(false);
        if (pollingRef.current) {
          window.clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    }, 3000);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] || null);
    setSelectedFileDuration(null);
    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Choose a video file before uploading.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setUploadProgress(0);
      setJob(null);

      const formData = new FormData();
      formData.append("video", selectedFile);

      const response = await uploadVideo(formData, setUploadProgress);
      setJob(response.job);
      startPolling(response.job.id);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Upload failed. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7fb_0%,#fff9f5_28%,#ffffff_62%,#fff8f5_100%)] text-slate-900">
      <TopNav />

      {!hasToken ? (
        <>
          <section className="px-5 pb-14 pt-8 sm:px-8">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.98fr_1.02fr]">
              <div className="space-y-7">
                <p className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">
                  AI video content platform
                </p>
                <div className="space-y-5">
                  <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                    Turn videos into ready-to-publish content with AI.
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                    Upload one source video and generate transcript, blog post, YouTube
                    description, captions, and exportable reports. Self-serve is optimized
                    for videos up to {siteConfig.selfServeMaxMinutes} minutes.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/signup"
                    className="rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(244,63,94,0.24)]"
                  >
                    Start self-serve
                  </Link>
                  <Link
                    href="/pricing"
                    className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900"
                  >
                    Limits & service options
                  </Link>
                  <a
                    href={siteConfig.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700"
                  >
                    WhatsApp for longer videos
                  </a>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {serviceOptions.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 px-4 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {item.name}
                      </p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight">{item.price}</p>
                      <p className="mt-2 text-sm text-slate-600">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,#ffe3ec,#fff4ec)] p-5 shadow-[0_28px_80px_rgba(15,23,42,0.12)]">
                <div className="rounded-[1.75rem] border border-white/90 bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)]">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
                        Workflow preview
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                        One upload, many outputs
                      </h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Queue + exports
                    </span>
                  </div>

                  <div className="aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#ff6b35,#ff4d8d_36%,#2563eb_100%)] p-4">
                    <div className="flex h-full flex-col justify-between rounded-[1.25rem] border border-white/25 bg-slate-950/15 p-4 text-white backdrop-blur">
                      <div className="flex flex-wrap gap-3">
                        {["Transcript", "Blog", "YouTube", "Captions"].map((item) => (
                          <div key={item} className="rounded-2xl bg-white/20 px-4 py-3 text-sm">
                            {item}
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-3">
                        <div className="rounded-2xl bg-white/15 px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                            Queue powered
                          </p>
                          <p className="mt-2 text-lg font-medium">
                            Your upload is processed in the background with retries and progress tracking.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/15 px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                            Export everywhere
                          </p>
                          <p className="mt-2 text-lg font-medium">
                            Download assets from cloud storage or export everything to text and PDF.
                          </p>
                        </div>
                        <div className="rounded-2xl bg-white/15 px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                            Grow beyond self-serve
                          </p>
                          <p className="mt-2 text-lg font-medium">
                            Need {siteConfig.manualServiceRange} videos or AI-assisted editing? Send the brief to our team on WhatsApp.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="grid gap-4 lg:grid-cols-4">
                {trustHighlights.map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[1.5rem] border border-slate-200/80 bg-white/92 p-5 shadow-[0_16px_45px_rgba(15,23,42,0.05)]"
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{item.value}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="mx-auto max-w-3xl text-center">
                <p className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Value
                </p>
                <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                  A solution built around your workflow.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Designed for creators, agencies, and teams that need faster turnaround from a single source video.
                </p>
              </div>
              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {featureCards.map((card) => (
                  <article
                    key={card.title}
                    className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
                  >
                    <div className="mb-5 h-12 w-12 rounded-2xl bg-[linear-gradient(135deg,#2563eb,#ec4899)]" />
                    <h3 className="text-2xl font-semibold tracking-tight">{card.title}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">{card.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Use cases
                </p>
                <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Built for real content teams, not toy demos.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  The workflow is designed to help you move from raw video to client-ready written assets with less manual work.
                </p>
              </div>
              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {useCases.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,#fff9fb)] p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
                  >
                    <div className="mb-5 h-12 w-12 rounded-2xl bg-[linear-gradient(135deg,#0f172a,#334155)]" />
                    <h3 className="text-2xl font-semibold tracking-tight">{item.title}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,#fff7fb)] p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:p-12">
              <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Deliverables
                  </p>
                  <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                    More than a transcript.
                  </h2>
                  <p className="mt-4 text-lg leading-8 text-slate-600">
                    Every finished job can now deliver timestamped chapters and subtitle files alongside your written content pack, which makes the service feel much more client-ready.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {deliverables.map((item) => (
                    <div
                      key={item}
                      className="rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)] lg:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <p className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">
                  Simple process
                </p>
                <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Create your masterpiece in 3 simple steps.
                </h2>
              </div>
              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {[
                  "Upload your video",
                  "Process and generate assets",
                  "Download and publish",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-[1.75rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,#fff9fb)] p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
                  >
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-rose-500 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight">{step}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">
                      {index === 0
                        ? `Send a video up to ${siteConfig.selfServeMaxMinutes} minutes into the self-serve queue.`
                        : index === 1
                          ? "The worker extracts audio, transcribes, and builds reusable written outputs."
                          : "Open job detail pages to download source files, text bundles, and polished PDF reports."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,#fff6f2)] p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)] lg:p-12">
              <div className="mx-auto max-w-3xl text-center">
                <p className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Output preview
                </p>
                <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Content that feels ready to use, not raw AI spill.
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Each job produces a structured content pack your team can review, copy,
                  and publish without digging through a messy transcript dump.
                </p>
              </div>
              <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {sampleOutputs.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-7 shadow-[0_18px_45px_rgba(15,23,42,0.05)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-500">
                      Included output
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-base leading-7 text-slate-600">{item.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200/80 bg-[linear-gradient(180deg,#fff0f5,#ffffff)] p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                  Need bigger videos or done-for-you AI work?
                </h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">
                  Self-serve is capped at {siteConfig.selfServeMaxMinutes} minutes per video and {siteConfig.selfServeDailyVideos} videos per day.
                  For {siteConfig.manualServiceRange} source files, special editing requests, or client delivery, send the job to us directly.
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  {["10 min = $1", "20 min = $2", "30 min = $3", "60 min custom quote"].map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <Link
                    href="/pricing"
                    className="inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white"
                  >
                    See service options
                  </Link>
                  <a
                    href={siteConfig.whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-700"
                  >
                    Contact on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="px-5 py-12 sm:px-8">
            <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
              <div className="mx-auto max-w-3xl text-center">
                <p className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  FAQ
                </p>
                <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Clear rules, simple workflow.
                </h2>
              </div>
              <div className="mt-10 grid gap-4">
                {faqItems.map((item) => (
                  <article
                    key={item.question}
                    className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5"
                  >
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                      {item.question}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
          <SiteFooter />
        </>
      ) : (
        <>
          <section className="px-5 pb-14 pt-8 sm:px-8">
            <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,#fff4f8,#ffffff)] p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
                <p className="inline-flex rounded-full border border-rose-200 bg-rose-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-rose-500">
                  Workspace
                </p>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                  Upload a video and let the queue do the work.
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                  Processing runs in the background and returns transcript, blog, YouTube description,
                  captions, cloud downloads, and exportable bundles.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <label
                    htmlFor="video-upload"
                    className="flex cursor-pointer flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-rose-300 bg-white px-6 py-12 text-center"
                  >
                    <span className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-500">
                      Select video
                    </span>
                    <span className="mt-3 text-xl font-medium text-slate-900">
                      {selectedFile ? selectedFile.name : "Choose a video up to 50MB"}
                    </span>
                    {selectedFileSummary ? (
                      <span className="mt-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {selectedFileSummary}
                      </span>
                    ) : null}
                    <span className="mt-2 text-sm text-slate-500">
                      Max duration: {siteConfig.selfServeMaxMinutes} minutes. Max {siteConfig.selfServeDailyVideos} uploads per day. Video files only.
                    </span>
                  </label>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />

                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white disabled:bg-rose-300"
                    >
                      {isSubmitting ? "Uploading..." : "Queue video"}
                    </button>
                    <Link
                      href="/jobs"
                      className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900"
                    >
                      View job history
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900"
                    >
                      Log out
                    </button>
                  </div>

                  {isSubmitting ? (
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                        <span>Upload progress</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-rose-100">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#fb7185,#f97316)]"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : null}

                  {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {error}
                    </div>
                  ) : null}

                  <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50/80 px-5 py-4 text-sm leading-7 text-emerald-800">
                    Need more than {siteConfig.selfServeMaxMinutes} minutes, AI editing help, or done-for-you processing?{" "}
                    <a
                      href={siteConfig.whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold underline underline-offset-4"
                    >
                      Send the project to us on WhatsApp
                    </a>{" "}
                    for manual handling.
                  </div>
                </form>
              </section>

              <aside className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-300">
                  Queue status
                </p>
                {job ? (
                  <div className="mt-6 space-y-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-400">Current upload</p>
                        <h2 className="mt-1 break-all text-2xl font-semibold tracking-tight">
                          {activeJobName}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">Job ID: {job.id}</p>
                      </div>
                      <StatusBadge status={job.status} />
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                        <span>Backend progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,#fb7185,#38bdf8)] transition-all"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    </div>
                    {activeJobStage ? (
                      <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Current stage
                        </p>
                        <p className="mt-3 text-2xl font-semibold tracking-tight">
                          {activeJobStage.label}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {activeJobStage.summary}
                        </p>
                        <div className="mt-5 grid gap-3">
                          {activeJobStage.steps.map((step, index) => {
                            const isCompleted =
                              job.status === "completed"
                                ? true
                                : job.status === "failed"
                                  ? index === activeJobStage.index
                                  : index <= activeJobStage.index;

                            return (
                              <div
                                key={step.label}
                                className={`rounded-[1.1rem] border px-4 py-3 ${
                                  isCompleted
                                    ? "border-white/20 bg-white/10"
                                    : "border-white/8 bg-white/[0.03]"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                      isCompleted
                                        ? "bg-white text-slate-950"
                                        : "bg-white/10 text-slate-200"
                                    }`}
                                  >
                                    {index + 1}
                                  </span>
                                  <div>
                                    <p className="text-sm font-semibold text-white">
                                      {step.label}
                                    </p>
                                    <p className="text-xs leading-6 text-slate-300">
                                      {step.summary}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                    {job.errorMessage ? (
                      <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                        {job.errorMessage}
                      </div>
                    ) : null}
                    <div className="grid gap-3">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="rounded-full bg-white px-5 py-3 text-center text-sm font-semibold text-slate-950"
                      >
                        Open details & downloads
                      </Link>
                      <a
                        href={job.inputUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white"
                      >
                        View source asset
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                    <div>
                      <p className="text-lg font-semibold">No active job yet</p>
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        Upload a video to start a queued processing run. Results will appear here and in your job history.
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-4 text-sm leading-7 text-emerald-100">
                      Larger project? We can handle {siteConfig.manualServiceRange} videos, AI cleanup, and custom delivery outside the self-serve queue.
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </section>
          <SiteFooter />
        </>
      )}
    </main>
  );
}
