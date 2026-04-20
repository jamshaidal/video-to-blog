const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923001234567";

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
};
