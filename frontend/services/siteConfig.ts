const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923265641620";

const encodedMessage = encodeURIComponent(
  "Hi, I need help with a longer video or custom AI video processing service."
);

export const siteConfig = {
  brandName: "MotionCraftAI",
  brandTagline: "AI Video Repurposing Studio",
  whatsappNumber,
  whatsappLink: `https://wa.me/${whatsappNumber}?text=${encodedMessage}`,
  selfServeMaxMinutes: 5,
  selfServeDailyVideos: 3,
  manualServiceRange: "10 to 60 minutes",
  supportLabel: "WhatsApp Support",
  supportedFormats: ["MP4", "MOV", "WEBM", "M4V"],
  averageTurnaround: "Most short uploads finish in a few minutes once processing starts.",
  privateWorkspaceMessage: "Every upload stays inside an authenticated workspace with private download links.",
  expectedOutputs: [
    "Transcript cleanup",
    "Blog draft",
    "YouTube description",
    "Platform-ready captions",
    "TXT and PDF export",
  ],
  mediaServices: [
    {
      title: "Video editing",
      summary: "Trim, clean, format, and prepare clips for publishing or client delivery.",
      delivery: "Manual service",
    },
    {
      title: "Extract audio",
      summary: "Convert video into clean audio files for podcasts, voice notes, or reuse.",
      delivery: "MP3 or WAV",
    },
    {
      title: "Extract video",
      summary: "Create video-only versions, mute source audio, or prepare silent visuals.",
      delivery: "Video-only export",
    },
    {
      title: "Combine audio and video",
      summary: "Sync voiceover, music, narration, or replacement audio with a video.",
      delivery: "Matched export",
    },
    {
      title: "Add subtitles",
      summary: "Burn captions into video or prepare subtitle files for upload platforms.",
      delivery: "SRT, VTT, or embedded",
    },
    {
      title: "Content repurposing",
      summary: "Generate transcript, blog, YouTube description, social captions, and PDF reports.",
      delivery: "Self-serve or manual",
    },
  ],
};
