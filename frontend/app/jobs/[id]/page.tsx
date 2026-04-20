"use client";

import { jsPDF } from "jspdf";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteFooter } from "../../../components/SiteFooter";
import { StatusBadge } from "../../../components/StatusBadge";
import { TopNav } from "../../../components/TopNav";
import { getDownloadLinks, getJob, type Job } from "../../../services/api";
import {
  formatCaptionsForExport,
  formatTimelineTimestamp,
  getCaptionLabel,
  getJobDisplayName,
  getJobExportBaseName,
  getJobStage,
} from "../../../services/jobPresentation";

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
}

function exportJobAsText(job: Job) {
  if (!job.result) {
    return;
  }

  const exportBaseName = getJobExportBaseName(job);
  const captionSections = formatCaptionsForExport(job.result.captions);

  const body = [
    `File Name: ${getJobDisplayName(job)}`,
    `Job ID: ${job.id}`,
    `Generated: ${new Date(job.updatedAt).toLocaleString()}`,
    "",
    "=== TRANSCRIPT ===",
    job.result.transcript,
    "",
    "=== BLOG ===",
    job.result.blog,
    "",
    "=== YOUTUBE DESCRIPTION ===",
    job.result.youtubeDescription || "",
    "",
    "=== CAPTIONS ===",
    captionSections.join("\n\n"),
  ].join("\n");

  downloadTextFile(`${exportBaseName}-content-bundle.txt`, body);
}

function exportJobAsPdf(job: Job) {
  if (!job.result) {
    return;
  }

  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const width = pdf.internal.pageSize.getWidth() - margin * 2;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const lineHeight = 15;
  let y = margin;
  const exportBaseName = getJobExportBaseName(job);

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight <= pageHeight - margin) {
      return;
    }

    pdf.addPage();
    y = margin;
  };

  const addWrappedParagraph = (body: string) => {
    const paragraphs = body.split("\n");

    for (const paragraph of paragraphs) {
      const lines = pdf.splitTextToSize(paragraph || " ", width) as string[];

      for (const line of lines) {
        ensureSpace(lineHeight);
        pdf.text(line, margin, y);
        y += lineHeight;
      }

      y += 6;
    }
  };

  const addSection = (title: string, body: string) => {
    ensureSpace(36);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(title, margin, y);
    y += 22;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    addWrappedParagraph(body);
    y += 18;
  };

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(22);
  pdf.text("MotionCraftAI Content Report", margin, y);
  y += 26;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(11);
  pdf.text(`File Name: ${getJobDisplayName(job)}`, margin, y);
  y += 16;
  pdf.text(`Job ID: ${job.id}`, margin, y);
  y += 16;
  pdf.text(`Generated: ${new Date(job.updatedAt).toLocaleString()}`, margin, y);
  y += 32;

  addSection("Transcript", job.result.transcript);
  addSection("Blog", job.result.blog);
  if (job.result.youtubeDescription) {
    addSection("YouTube Description", job.result.youtubeDescription);
  }
  for (const [index, caption] of job.result.captions.entries()) {
    addSection(`Caption ${index + 1}`, caption);
  }

  pdf.save(`${exportBaseName}-content-report.pdf`);
}

function getChapterMetadata(job: Job | null) {
  const metadata = job?.result?.outputUrls?.metadata;

  if (!metadata || Array.isArray(metadata) || !("chapters" in metadata)) {
    return [];
  }

  return Array.isArray(metadata.chapters) ? metadata.chapters : [];
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [downloads, setDownloads] = useState<Record<string, { signedUrl: string; url: string }>>({});
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState("");
  const jobDisplayName = job ? getJobDisplayName(job) : "";
  const jobStage = job ? getJobStage(job) : null;
  const chapters = getChapterMetadata(job);

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((currentKey) => (currentKey === key ? "" : currentKey));
    }, 1800);
  };

  useEffect(() => {
    let intervalId: number | null = null;

    async function loadJob() {
      try {
        const nextJob = await getJob(params.id);
        setJob(nextJob);

        if (nextJob.status === "completed") {
          const files = await getDownloadLinks(params.id);
          setDownloads(files);
        }
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load job."
        );
      }
    }

    loadJob();
    intervalId = window.setInterval(loadJob, 3000);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [params.id]);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7fb,#ffffff)] text-slate-900">
      <TopNav />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Job output
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Content detail & exports</h1>
            <p className="mt-2 text-slate-600">Review generated assets, secure downloads, and export everything as TXT or PDF.</p>
          </div>
          <Link href="/jobs" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold">
            Back to jobs
          </Link>
        </div>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {job ? (
          <>
            <section className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_18px_60px_rgba(148,163,184,0.16)]">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Uploaded file</p>
                    <h2 className="break-all text-2xl font-semibold tracking-tight">
                      {jobDisplayName}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">Job ID: {job.id}</p>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
                  <span>Progress</span>
                  <span>{job.progress}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#fb7185,#f97316)]"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>

              {jobStage ? (
                <div className="mb-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Current stage
                  </p>
                  <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">
                    {jobStage.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {jobStage.summary}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <a
                  href={job.inputUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold"
                >
                  View source video
                </a>
                {job.result ? (
                  <>
                    <button
                      onClick={() => exportJobAsText(job)}
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Download TXT bundle
                    </button>
                    <button
                      onClick={() => exportJobAsPdf(job)}
                      className="rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white"
                    >
                      Download PDF report
                    </button>
                  </>
                ) : null}
              </div>

              {job.errorMessage ? (
                <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {job.errorMessage}
                </div>
              ) : null}
            </section>

            <section className="mt-6 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Generated
                </p>
                <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                  {new Date(job.updatedAt).toLocaleString()}
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Captions ready
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                  {job.result?.captions.length || 0}
                </p>
              </article>
              <article className="rounded-[1.5rem] border border-white/80 bg-white/90 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.14)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  Current stage
                </p>
                <p className="mt-3 text-lg font-semibold tracking-tight text-slate-950">
                  {jobStage?.label || "Queued"}
                </p>
              </article>
            </section>

            {job.result ? (
              <section className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                <article className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.18)]">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-2xl font-semibold tracking-tight">Transcript</h3>
                    <button
                      onClick={() => handleCopy("transcript", job.result!.transcript)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      {copiedKey === "transcript" ? "Copied" : "Copy transcript"}
                    </button>
                  </div>
                  <p className="max-h-[42rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                    {job.result.transcript}
                  </p>
                </article>

                <div className="grid gap-6">
                  {chapters.length ? (
                    <article className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.18)]">
                      <div className="mb-4">
                        <h3 className="text-2xl font-semibold tracking-tight">Chapters</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Timestamped sections for navigation, descriptions, and show notes.
                        </p>
                      </div>
                      <div className="grid gap-3">
                        {chapters.map((chapter, index) => (
                          <div
                            key={`${chapter.title}-${index}`}
                            className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <p className="text-base font-semibold tracking-tight text-slate-950">
                                {chapter.title}
                              </p>
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                                {formatTimelineTimestamp(chapter.startTimeSeconds)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-slate-600">
                              {chapter.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ) : null}

                  <article className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.18)]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-2xl font-semibold tracking-tight">Blog</h3>
                      <button
                        onClick={() => handleCopy("blog", job.result!.blog)}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        {copiedKey === "blog" ? "Copied" : "Copy blog"}
                      </button>
                    </div>
                    <p className="max-h-[24rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                      {job.result.blog}
                    </p>
                  </article>

                  {job.result.youtubeDescription ? (
                    <article className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.18)]">
                      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-2xl font-semibold tracking-tight">
                          YouTube Description
                        </h3>
                        <button
                          onClick={() =>
                            handleCopy(
                              "youtube-description",
                              job.result!.youtubeDescription || ""
                            )
                          }
                          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          {copiedKey === "youtube-description"
                            ? "Copied"
                            : "Copy description"}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-base">
                        {job.result.youtubeDescription}
                      </p>
                    </article>
                  ) : null}

                  <article className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.18)]">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-tight">Captions</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Ready-to-post angles for multiple publishing surfaces.
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleCopy(
                            "captions",
                            formatCaptionsForExport(job.result!.captions).join("\n\n")
                          )
                        }
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        {copiedKey === "captions" ? "Copied" : "Copy caption set"}
                      </button>
                    </div>
                    <div className="grid gap-3">
                      {job.result.captions.map((caption, index) => (
                        <div
                          key={`${caption}-${index}`}
                          className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-600 sm:text-base"
                        >
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                              {getCaptionLabel(index)}
                            </div>
                            <button
                              onClick={() =>
                                handleCopy(`caption-${index}`, caption)
                              }
                              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                            >
                              {copiedKey === `caption-${index}` ? "Copied" : "Copy"}
                            </button>
                          </div>
                          {caption}
                        </div>
                      ))}
                    </div>
                  </article>

                  {Object.keys(downloads).length ? (
                    <article className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.18)]">
                      <h3 className="mb-4 text-2xl font-semibold tracking-tight">Cloud file downloads</h3>
                      <p className="mb-4 text-sm text-slate-500">
                        Includes transcript files, chapter exports, and subtitle formats like SRT and VTT when available.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {Object.entries(downloads).map(([key, value]) => (
                          <a
                            key={key}
                            href={value.signedUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold"
                          >
                            Download {key}
                          </a>
                        ))}
                      </div>
                    </article>
                  ) : null}
                </div>
              </section>
            ) : null}
          </>
        ) : (
          <section className="mt-8 rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_18px_60px_rgba(148,163,184,0.16)]">
            <p className="text-sm leading-7 text-slate-600">
              Loading your content workspace...
            </p>
          </section>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
