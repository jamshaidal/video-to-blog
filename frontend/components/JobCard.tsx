"use client";

import Link from "next/link";
import type { Job } from "../services/api";
import { getJobDisplayName, getJobStage } from "../services/jobPresentation";
import { StatusBadge } from "./StatusBadge";

export function JobCard({ job }: { job: Job }) {
  const createdAt = new Date(job.createdAt).toLocaleString();
  const hasResult = Boolean(job.result);
  const displayName = getJobDisplayName(job);
  const stage = getJobStage(job);

  return (
    <article className="rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.16)]">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Job {job.id.slice(0, 8)}
          </p>
          <p className="mt-2 break-all text-xl font-semibold tracking-tight text-slate-900">
            {displayName}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-700">
            {hasResult ? "Content pack ready" : "Processing in workspace"}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {stage.label}: {stage.summary}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Created {createdAt}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>Progress</span>
          <span>{job.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#f59e0b,#f97316)] transition-all"
            style={{ width: `${job.progress}%` }}
          />
        </div>
      </div>

      {hasResult ? (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Transcript
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {job.result?.transcript}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Captions
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {job.result?.captions.length || 0} ready to export
            </p>
          </div>
        </div>
      ) : null}

      {job.errorMessage ? (
        <p className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {job.errorMessage}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <a
          href={job.inputUrl}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-medium text-amber-700"
        >
          View input
        </a>
        <Link href={`/jobs/${job.id}`} className="text-sm font-semibold text-slate-900">
          Open details
        </Link>
      </div>
    </article>
  );
}
