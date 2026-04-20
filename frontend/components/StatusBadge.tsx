"use client";

type StatusBadgeProps = {
  status: "pending" | "processing" | "completed" | "failed";
};

const statusStyles: Record<StatusBadgeProps["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  processing: "bg-sky-100 text-sky-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${statusStyles[status]}`}
    >
      <span className="h-2 w-2 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}
