"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JobCard } from "../../components/JobCard";
import { SiteFooter } from "../../components/SiteFooter";
import { TopNav } from "../../components/TopNav";
import { clearToken, getToken } from "../../services/auth";
import { getJobs, type Job } from "../../services/api";
import { getJobDisplayName } from "../../services/jobPresentation";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [hasToken] = useState(() => Boolean(getToken()));
  const completedJobs = jobs.filter((job) => job.status === "completed").length;
  const runningJobs = jobs.filter(
    (job) => job.status === "pending" || job.status === "processing"
  ).length;
  const filteredJobs = jobs.filter((job) => {
    const jobName = getJobDisplayName(job).toLowerCase();
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      jobName.includes(normalizedSearch) ||
      job.id.toLowerCase().includes(normalizedSearch);
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;

    const createdAt = new Date(job.createdAt);
    const now = new Date();
    let matchesDate = true;

    if (dateFilter === "today") {
      matchesDate = createdAt.toDateString() === now.toDateString();
    }

    if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      matchesDate = createdAt >= weekAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  useEffect(() => {
    if (!hasToken) {
      return;
    }

    getJobs()
      .then(setJobs)
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load jobs."
        );
      });
  }, [hasToken]);

  if (!hasToken) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff7fb,#fffdf8)] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
          <p className="text-slate-600">Please log in to view your jobs.</p>
          <Link href="/login" className="mt-4 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff7fb,#ffffff)] text-slate-900">
      <TopNav />
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
            <p className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Dashboard
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Job history</h1>
            <p className="mt-2 text-slate-600">Track every queued, running, completed, or failed content workflow.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold">
              Back to upload
            </Link>
            <button
              onClick={() => {
                clearToken();
                window.location.href = "/login";
              }}
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Log Out
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Total jobs
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{jobs.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Completed
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{completedJobs}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              In progress
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{runningJobs}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(148,163,184,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Matching filters
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {filteredJobs.length}
            </p>
          </div>
        </div>

        <section className="mb-8 rounded-[1.75rem] border border-white/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(148,163,184,0.12)]">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.45fr_0.45fr]">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Search jobs
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by uploaded filename or job ID"
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-rose-300 focus:bg-white"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Created
              <select
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-rose-300 focus:bg-white"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 days</option>
              </select>
            </label>
          </div>
        </section>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!jobs.length ? (
          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Empty workspace
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              No jobs yet
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Upload your first video to create a transcript, blog, captions, and downloadable report.
              Completed work will appear here with progress tracking and exports.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Upload a video
            </Link>
          </div>
        ) : filteredJobs.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-white/80 bg-white/90 p-8 shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              No filter match
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              No jobs match these filters
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Try clearing the search, widening the date range, or switching back to all statuses.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setDateFilter("all");
              }}
              className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
