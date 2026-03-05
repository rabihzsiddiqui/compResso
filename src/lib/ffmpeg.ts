import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import type { CompressOptions, CompressResult } from "@/types";
import { CODEC_ENCODER_MAP, CODEC_CONTAINER_MAP } from "@/lib/utils";

// CDN base for ffmpeg-core 0.12.x
const CORE_VERSION = "0.12.6";
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

// Singleton instance — one FFmpeg worker for the page lifetime
let instance: FFmpeg | null = null;
let loadPromise: Promise<void> | null = null;

export async function loadFFmpeg(
  onProgress?: (progress: number) => void
): Promise<FFmpeg> {
  if (instance?.loaded) return instance;

  if (!loadPromise) {
    loadPromise = (async () => {
      instance = new FFmpeg();

      if (onProgress) {
        instance.on("progress", ({ progress }) => {
          // During load, ffmpeg emits fractional progress 0–1
          onProgress(Math.round(progress * 100));
        });
      }

      await instance.load({
        coreURL: `${CORE_BASE}/ffmpeg-core.js`,
        wasmURL: `${CORE_BASE}/ffmpeg-core.wasm`,
      });
    })();
  }

  await loadPromise;
  return instance!;
}

/**
 * Compress a video file in-browser using FFmpeg WASM.
 *
 * @param inputFile      - the original File from a file input or drop
 * @param options        - codec, crf, resolution, bitrate
 * @param onProgress     - called with 0–100 during encoding
 * @returns              - compressed bytes + metadata
 */
export async function compressVideo(
  inputFile: File,
  options: CompressOptions,
  onProgress?: (progress: number) => void
): Promise<CompressResult> {
  const ffmpeg = await loadFFmpeg();

  const encoder = CODEC_ENCODER_MAP[options.outputCodec];
  const ext = CODEC_CONTAINER_MAP[options.outputCodec];
  const inputName = "input." + inputFile.name.split(".").pop();
  const outputName = `output.${ext}`;

  // Wire up progress for the encode pass
  const progressHandler = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(99, Math.round(progress * 100)));
  };
  ffmpeg.on("progress", progressHandler);

  try {
    await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

    const args: string[] = ["-i", inputName];

    // Video codec + quality
    args.push("-c:v", encoder, "-crf", String(options.crf));

    // Scale filter — keep aspect ratio, only scale if resolution is set
    if (options.resolution) {
      const [w, h] = options.resolution.split("x");
      // Scale down only; if source is smaller, leave it alone
      args.push(
        "-vf",
        `scale='min(${w},iw)':'min(${h},ih)':force_original_aspect_ratio=decrease`
      );
    }

    // Bitrate cap
    if (options.bitrate) {
      args.push("-b:v", options.bitrate, "-maxrate", options.bitrate, "-bufsize", options.bitrate);
    }

    // Audio — copy through to avoid re-encoding
    args.push("-c:a", "aac", "-b:a", "128k");

    // AV1 is slow; limit to 4 threads and use a faster preset
    if (options.outputCodec === "av1") {
      args.push("-cpu-used", "4", "-row-mt", "1");
    }

    // VP9 two-pass is better quality but we skip it for simplicity
    if (options.outputCodec === "vp9") {
      args.push("-quality", "good", "-speed", "4");
    }

    args.push(outputName);

    const exitCode = await ffmpeg.exec(args);
    if (exitCode !== 0) {
      throw new Error(`FFmpeg exited with code ${exitCode}`);
    }

    const rawOutput = await ffmpeg.readFile(outputName);
    if (typeof rawOutput === "string") {
      throw new Error("Unexpected string output from FFmpeg readFile");
    }
    // FFmpeg WASM uses regular ArrayBuffers — cast is safe
    const outputData = rawOutput as Uint8Array<ArrayBuffer>;

    // Best-effort duration from log parsing — ffprobe isn't available in
    // the standard core build so we fall back to null
    const duration = await extractDuration(ffmpeg, inputName);

    // Clean up WASM FS
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    onProgress?.(100);

    const stem = inputFile.name.replace(/\.[^.]+$/, "");
    return {
      data: outputData,
      size: outputData.byteLength,
      duration,
      filename: `${stem}_compressed.${ext}`,
    };
  } finally {
    ffmpeg.off("progress", progressHandler);
  }
}

async function extractDuration(
  ffmpeg: FFmpeg,
  filename: string
): Promise<number | null> {
  try {
    const probeOut = "probe_out.txt";
    const code = await ffmpeg.ffprobe([
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filename,
      "-o", probeOut,
    ]);

    if (code !== 0) return null;

    const raw = await ffmpeg.readFile(probeOut, "utf8");
    await ffmpeg.deleteFile(probeOut);

    const seconds = parseFloat(typeof raw === "string" ? raw : new TextDecoder().decode(raw));
    return isNaN(seconds) ? null : seconds;
  } catch {
    return null;
  }
}
