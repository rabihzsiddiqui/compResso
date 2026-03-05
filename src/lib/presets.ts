import type { Preset } from "@/types";

// Discord's free upload limit is 25MB. At 720p we target ~3Mbps which lands
// a typical 60s clip well under that ceiling. For longer clips the caller
// should use the discord bitrate calculator helper below.
export const PRESETS: Preset[] = [
  {
    id: "web",
    label: "web",
    description: "1080p h.264 — good balance of quality and compatibility",
    codec: "h264",
    crf: 23,
    resolution: "1920x1080",
    bitrate: "5M",
  },
  {
    id: "social",
    label: "social",
    description: "1080p h.264 — higher bitrate for uploads that get re-encoded",
    codec: "h264",
    crf: 20,
    resolution: "1920x1080",
    bitrate: "8M",
  },
  {
    id: "discord",
    label: "discord",
    description: "720p, bitrate calculated to fit under 25MB",
    codec: "h264",
    crf: 28,
    resolution: "1280x720",
    bitrate: "3M",
  },
  {
    id: "archive",
    label: "4k archive",
    description: "2160p h.264 at high bitrate — large file, high quality",
    codec: "h264",
    crf: 18,
    resolution: "3840x2160",
    bitrate: "20M",
  },
  {
    id: "custom",
    label: "custom",
    description: "configure everything yourself",
    codec: "h264",
    crf: 23,
    resolution: null,
    bitrate: null,
  },
];

/**
 * Calculate a bitrate (in kbps) that keeps the output under a target file
 * size given a known duration.
 *
 * @param targetMB  - target max file size in megabytes
 * @param durationS - video duration in seconds
 * @param audioKbps - estimated audio bitrate to subtract (default 128)
 */
export function bitrateForSize(
  targetMB: number,
  durationS: number,
  audioKbps = 128
): number {
  if (durationS <= 0) return 1000;
  const totalKbits = targetMB * 8 * 1024;
  return Math.max(100, Math.floor(totalKbits / durationS) - audioKbps);
}

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
