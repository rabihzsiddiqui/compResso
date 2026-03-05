"use client";

import { useState, useCallback, useRef } from "react";
import { loadFFmpeg, compressVideo } from "@/lib/ffmpeg";
import type { CompressOptions, CompressResult, FFmpegStatus } from "@/types";

interface UseFFmpegReturn {
  status: FFmpegStatus;
  progress: number;
  error: string | null;
  result: CompressResult | null;
  load: () => Promise<void>;
  compress: (file: File, options: CompressOptions) => Promise<CompressResult | null>;
  reset: () => void;
}

export function useFFmpeg(): UseFFmpegReturn {
  const [status, setStatus] = useState<FFmpegStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompressResult | null>(null);

  const activeRef = useRef(true);

  const safeSet = useCallback(
    <T>(setter: (v: T) => void) =>
      (value: T) => {
        if (activeRef.current) setter(value);
      },
    []
  );

  const load = useCallback(async () => {
    if (status === "ready" || status === "loading") return;

    setStatus("loading");
    setError(null);

    try {
      await loadFFmpeg(safeSet(setProgress));
      safeSet(setStatus)("ready");
    } catch (err) {
      safeSet(setError)(err instanceof Error ? err.message : "failed to load ffmpeg");
      safeSet(setStatus)("error");
    }
  }, [status, safeSet]);

  const compress = useCallback(
    async (file: File, options: CompressOptions): Promise<CompressResult | null> => {
      setStatus("compressing");
      setProgress(0);
      setError(null);
      setResult(null);

      try {
        await loadFFmpeg();
        const output = await compressVideo(file, options, safeSet(setProgress));
        safeSet(setResult)(output);
        safeSet(setStatus)("ready");
        return output;
      } catch (err) {
        safeSet(setError)(err instanceof Error ? err.message : "compression failed");
        safeSet(setStatus)("error");
        return null;
      }
    },
    [safeSet]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setError(null);
    setResult(null);
  }, []);

  return { status, progress, error, result, load, compress, reset };
}
