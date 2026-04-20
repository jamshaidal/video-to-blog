import type { Job } from "./api";

const captionLabels = [
  "Instagram caption",
  "LinkedIn caption",
  "X post",
  "Facebook caption",
  "YouTube Shorts caption",
];

const queueStages = [
  {
    label: "Queued",
    summary: "Your file is uploaded and waiting for an open worker slot.",
  },
  {
    label: "Preparing",
    summary: "We validate the video and extract the source audio.",
  },
  {
    label: "Transcribing",
    summary: "Speech is converted into a clean transcript for reuse.",
  },
  {
    label: "Packaging",
    summary: "Blog copy, descriptions, captions, and downloads are being prepared.",
  },
] as const;

function stripFileExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, "");
}

export function getJobDisplayName(job: Pick<Job, "id" | "originalFileName">) {
  return job.originalFileName || `Job ${job.id.slice(0, 8)}`;
}

export function getJobExportBaseName(job: Pick<Job, "id" | "originalFileName">) {
  const preferredName = stripFileExtension(getJobDisplayName(job));

  return (
    preferredName
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || `job-${job.id.slice(0, 8)}`
  );
}

export function formatCaptionsForExport(captions: string[]) {
  return captions.map(
    (caption, index) => `${getCaptionLabel(index)}\n${caption}`
  );
}

export function getCaptionLabel(index: number) {
  return captionLabels[index] || `Caption ${index + 1}`;
}

export function getJobStage(job: Pick<Job, "status" | "progress" | "errorMessage">) {
  if (job.status === "failed") {
    return {
      index: 0,
      label: "Needs attention",
      summary:
        job.errorMessage ||
        "This job could not complete. Review the error message and try again.",
      steps: queueStages,
    };
  }

  if (job.status === "completed") {
    return {
      index: queueStages.length - 1,
      label: "Ready to publish",
      summary:
        "Your content bundle is complete and ready for review, copy, and download.",
      steps: queueStages,
    };
  }

  if (job.status === "pending") {
    return {
      index: 0,
      label: queueStages[0].label,
      summary: queueStages[0].summary,
      steps: queueStages,
    };
  }

  if (job.progress < 30) {
    return {
      index: 1,
      label: queueStages[1].label,
      summary: queueStages[1].summary,
      steps: queueStages,
    };
  }

  if (job.progress < 65) {
    return {
      index: 2,
      label: queueStages[2].label,
      summary: queueStages[2].summary,
      steps: queueStages,
    };
  }

  return {
    index: 3,
    label: queueStages[3].label,
    summary: queueStages[3].summary,
    steps: queueStages,
  };
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(seconds: number | null) {
  if (seconds === null || Number.isNaN(seconds)) {
    return "Detecting duration";
  }

  const totalSeconds = Math.round(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (!minutes) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${remainingSeconds}s`;
}

export function formatTimelineTimestamp(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
