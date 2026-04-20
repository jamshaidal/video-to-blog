import axios from "axios";
import { getToken } from "./auth";

export type Chapter = {
  title: string;
  startTimeSeconds: number;
  summary: string;
};

export type OutputFile = {
  key?: string;
  url: string;
};

export type OutputMetadata = {
  chapters?: Chapter[];
  durationSeconds?: number;
};

export type ResultBundle = {
  transcript: string;
  blog: string;
  captions: string[];
  youtubeDescription?: string | null;
  subtitlesUrl?: string | null;
  outputUrls?: Record<string, OutputFile | OutputMetadata>;
};

export type Job = {
  id: string;
  userId: string;
  originalFileName?: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  inputUrl: string;
  progress: number;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  result?: ResultBundle | null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export async function signup(email: string, password: string) {
  const { data } = await api.post("/auth/signup", { email, password });
  return data;
}

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  return data;
}

export async function uploadVideo(formData: FormData, onProgress?: (value: number) => void) {
  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 180000,
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) {
        return;
      }

      onProgress(Math.round((event.loaded / event.total) * 100));
    },
  });

  return data;
}

export async function getJobs() {
  const { data } = await api.get("/jobs");
  return data.jobs as Job[];
}

export async function getJob(id: string) {
  const { data } = await api.get(`/jobs/${id}`);
  return data.job as Job;
}

export async function getDownloadLinks(id: string) {
  const { data } = await api.get(`/download/${id}`);
  return data.downloads as Record<string, { signedUrl: string; url: string }>;
}

export default api;
