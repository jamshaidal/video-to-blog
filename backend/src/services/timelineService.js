function padTimestampUnit(value) {
  return String(Math.floor(value)).padStart(2, "0");
}

function formatTimestampForDisplay(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${padTimestampUnit(hours)}:${padTimestampUnit(minutes)}:${padTimestampUnit(seconds)}`;
  }

  return `${padTimestampUnit(minutes)}:${padTimestampUnit(seconds)}`;
}

function formatSubtitleTimestamp(totalSeconds, millisecondSeparator) {
  const safeSeconds = Math.max(0, Number(totalSeconds || 0));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = Math.floor(safeSeconds % 60);
  const milliseconds = Math.round((safeSeconds - Math.floor(safeSeconds)) * 1000);

  return `${padTimestampUnit(hours)}:${padTimestampUnit(minutes)}:${padTimestampUnit(seconds)}${millisecondSeparator}${String(milliseconds).padStart(3, "0")}`;
}

function normalizeSegments(segments, transcriptText, durationSeconds) {
  if (Array.isArray(segments) && segments.length) {
    return segments
      .filter((segment) => typeof segment?.text === "string" && segment.text.trim())
      .map((segment, index) => ({
        id: segment.id || index + 1,
        start: Number(segment.start || 0),
        end: Number(segment.end || segment.start || 0),
        text: segment.text.trim(),
      }));
  }

  return [
    {
      id: 1,
      start: 0,
      end: Number(durationSeconds || 0),
      text: transcriptText || "",
    },
  ];
}

function buildSubtitleArtifacts({ segments, transcriptText, durationSeconds }) {
  const normalizedSegments = normalizeSegments(
    segments,
    transcriptText,
    durationSeconds
  );

  const srt = normalizedSegments
    .map(
      (segment, index) =>
        `${index + 1}\n${formatSubtitleTimestamp(segment.start, ",")} --> ${formatSubtitleTimestamp(segment.end, ",")}\n${segment.text}`
    )
    .join("\n\n");

  const vtt = [
    "WEBVTT",
    "",
    ...normalizedSegments.map(
      (segment) =>
        `${formatSubtitleTimestamp(segment.start, ".")} --> ${formatSubtitleTimestamp(segment.end, ".")}\n${segment.text}`
    ),
  ].join("\n\n");

  const txt = normalizedSegments
    .map(
      (segment) =>
        `[${formatTimestampForDisplay(segment.start)} - ${formatTimestampForDisplay(segment.end)}] ${segment.text}`
    )
    .join("\n");

  return {
    segments: normalizedSegments,
    srt,
    vtt,
    txt,
  };
}

function buildTranscriptTimeline(segments) {
  return normalizeSegments(segments, "", 0)
    .map(
      (segment) =>
        `[${formatTimestampForDisplay(segment.start)} - ${formatTimestampForDisplay(segment.end)}] ${segment.text}`
    )
    .join("\n");
}

function formatChaptersForText(chapters) {
  return chapters
    .map(
      (chapter, index) =>
        `${index + 1}. ${formatTimestampForDisplay(chapter.startTimeSeconds)} ${chapter.title}\n${chapter.summary}`
    )
    .join("\n\n");
}

module.exports = {
  buildSubtitleArtifacts,
  buildTranscriptTimeline,
  formatChaptersForText,
  formatTimestampForDisplay,
};
