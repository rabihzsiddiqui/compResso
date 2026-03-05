import type { OutputCodec } from "@/types";

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "video";
}

export const CODEC_ENCODER_MAP: Record<OutputCodec, string> = {
  h264: "libx264",
  h265: "libx265",
  av1: "libaom-av1",
  vp9: "libvpx-vp9",
};

export const CODEC_CONTAINER_MAP: Record<OutputCodec, string> = {
  h264: "mp4",
  h265: "mp4",
  av1: "webm",
  vp9: "webm",
};
