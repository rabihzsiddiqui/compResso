export type OutputCodec = "h264" | "h265" | "av1" | "vp9";

export interface CompressOptions {
  outputCodec: OutputCodec;
  crf: number;
  resolution: string | null;
  bitrate: string | null;
}

export interface CompressResult {
  data: Uint8Array<ArrayBuffer>;
  size: number;
  duration: number | null;
  filename: string;
}

export interface Preset {
  id: string;
  label: string;
  description: string;
  codec: OutputCodec;
  crf: number;
  resolution: string | null;
  bitrate: string | null;
}

export type FFmpegStatus = "idle" | "loading" | "ready" | "compressing" | "error";
