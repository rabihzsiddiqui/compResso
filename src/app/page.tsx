"use client";

import { useState, useCallback, useEffect, startTransition } from "react";
import { useFFmpeg } from "@/hooks/useFFmpeg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FileDropZone } from "@/components/FileDropZone";
import { CodecSelector } from "@/components/CodecSelector";
import { PresetSelector } from "@/components/PresetSelector";
import { QualitySlider } from "@/components/QualitySlider";
import { ProgressDisplay } from "@/components/ProgressDisplay";
import { CompletionView } from "@/components/CompletionView";
import { PRESETS, getPreset } from "@/lib/presets";
import type { OutputCodec, CompressOptions, CompressResult, Preset } from "@/types";

type ViewState = "setup" | "processing" | "done";

interface FileResult {
  original: File;
  result: CompressResult;
}

const LARGE_FILE_THRESHOLD_MB = 500;

// ── Feature card ──────────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 transition-all duration-300 hover:border-rose-500/30 hover:shadow-xl hover:shadow-rose-500/5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-zinc-400">{description}</p>
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
      {children}
    </p>
  );
}

// ── Browser not supported banner ──────────────────────────────────────────────

function UnsupportedBrowser() {
  return (
    <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 md:p-8">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-white">
        browser not supported
      </h2>
      <p className="mb-3 text-sm leading-relaxed text-zinc-400">
        compresso requires{" "}
        <code className="rounded bg-zinc-700/60 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
          SharedArrayBuffer
        </code>
        , which is only available in cross-origin isolated contexts. make sure
        the site is served with the correct COOP/COEP headers.
      </p>
      <p className="text-xs text-zinc-500">
        works in chrome 92+, firefox 79+, and safari 15.2+. safari on ios
        requires version 15.2 or later.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const { status, progress, error, compress, reset: resetFFmpeg } = useFFmpeg();

  // Browser support — checked after mount to avoid SSR mismatch
  const [browserOk, setBrowserOk] = useState<boolean | null>(null);
  useEffect(() => {
    startTransition(() => {
      setBrowserOk(typeof SharedArrayBuffer !== "undefined");
    });
  }, []);

  // Setup state
  const [files, setFiles] = useState<File[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState("web");
  const [codec, setCodec] = useState<OutputCodec>("h264");
  const [crf, setCrf] = useState(23);

  // Page flow
  const [view, setView] = useState<ViewState>("setup");
  const [results, setResults] = useState<FileResult[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const currentPreset = getPreset(selectedPresetId) ?? PRESETS[0];

  // Computed warnings
  const hasLargeFile = files.some(
    (f) => f.size > LARGE_FILE_THRESHOLD_MB * 1024 * 1024
  );

  const handlePresetChange = useCallback((preset: Preset) => {
    setSelectedPresetId(preset.id);
    setCrf(preset.crf);
    setCodec(preset.codec);
  }, []);

  const handleAddFiles = useCallback((incoming: File[]) => {
    setFiles((prev) => [...prev, ...incoming]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCompress = useCallback(async () => {
    if (files.length === 0) return;

    const options: CompressOptions = {
      outputCodec: codec,
      crf,
      resolution: currentPreset.id !== "custom" ? currentPreset.resolution : null,
      bitrate: currentPreset.id !== "custom" ? currentPreset.bitrate : null,
    };

    setView("processing");
    setResults([]);

    const accumulated: FileResult[] = [];

    for (let i = 0; i < files.length; i++) {
      setCurrentFileIndex(i);
      const output = await compress(files[i], options);
      if (output) accumulated.push({ original: files[i], result: output });
    }

    if (accumulated.length > 0) {
      setResults(accumulated);
      setView("done");
    }
  }, [files, codec, crf, currentPreset, compress]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setView("setup");
    setResults([]);
    setCurrentFileIndex(0);
    resetFFmpeg();
  }, [resetFFmpeg]);

  const canCompress =
    files.length > 0 && status !== "compressing" && status !== "loading";

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />

      <main>
        {/* ── Hero ────────────────────────────────────────────────────── */}
        <section className="px-4 pb-12 pt-36 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400">
                runs locally
              </span>
              <span className="rounded-full border border-zinc-700/50 bg-zinc-800/50 px-3 py-1 text-xs font-medium text-zinc-400">
                no uploads
              </span>
              <span className="rounded-full border border-zinc-700/50 bg-zinc-800/50 px-3 py-1 text-xs font-medium text-zinc-400">
                browser-based
              </span>
            </div>

            <h1 className="mb-4 text-5xl font-bold leading-[1.1] text-white md:text-7xl">
              compResso<span className="text-rose-500">.</span>
            </h1>

            <p className="mb-4 text-lg text-zinc-300 md:text-xl">
              compress video files locally in your browser.
            </p>

            <p className="mx-auto max-w-md text-base leading-relaxed text-zinc-500">
              all processing happens on your device using ffmpeg.wasm. no files
              are sent anywhere. works offline once loaded.
            </p>
          </div>
        </section>

        {/* ── Main tool card ───────────────────────────────────────────── */}
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-2xl">
            {/* Unsupported browser — only shown after mount check resolves */}
            {browserOk === false ? (
              <UnsupportedBrowser />
            ) : (
              <div className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 md:p-8">
                {/* ── Setup view ── */}
                {view === "setup" && (
                  <div className="space-y-8">
                    <div>
                      <SectionLabel>files</SectionLabel>
                      <FileDropZone
                        files={files}
                        onAdd={handleAddFiles}
                        onRemove={handleRemoveFile}
                        disabled={status === "compressing"}
                      />

                      {/* Large file warning */}
                      {hasLargeFile && (
                        <p className="mt-3 rounded-lg border border-zinc-700/50 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400">
                          one or more files exceeds {LARGE_FILE_THRESHOLD_MB} MB. ffmpeg.wasm
                          keeps the entire file in browser memory — make sure
                          you have enough RAM available.
                        </p>
                      )}
                    </div>

                    <div>
                      <SectionLabel>preset</SectionLabel>
                      <PresetSelector
                        selectedId={selectedPresetId}
                        onChange={handlePresetChange}
                        disabled={status === "compressing"}
                      />
                    </div>

                    <div>
                      <SectionLabel>codec</SectionLabel>
                      <CodecSelector
                        value={codec}
                        onChange={setCodec}
                        disabled={status === "compressing"}
                      />

                      {codec === "av1" && (
                        <p className="mt-3 rounded-lg border border-rose-500/15 bg-rose-500/5 px-3 py-2 text-xs text-rose-400/80">
                          av1 encoding is thorough but slower than h.264/h.265.
                        </p>
                      )}
                    </div>

                    <div>
                      <SectionLabel>quality</SectionLabel>
                      <QualitySlider
                        value={crf}
                        onChange={setCrf}
                        disabled={status === "compressing"}
                      />
                    </div>

                    <button
                      onClick={handleCompress}
                      disabled={!canCompress}
                      className="w-full rounded-full bg-rose-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-rose-500 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                    >
                      {files.length === 0
                        ? "add files to compress"
                        : files.length === 1
                        ? "compress"
                        : `compress ${files.length} files`}
                    </button>
                  </div>
                )}

                {/* ── Processing view ── */}
                {view === "processing" && (
                  <div className="space-y-6">
                    {files.length > 1 && (
                      <p className="text-center text-xs text-zinc-500">
                        file{" "}
                        <span className="font-semibold text-zinc-300">
                          {currentFileIndex + 1}
                        </span>{" "}
                        of {files.length}
                      </p>
                    )}

                    <ProgressDisplay status={status} progress={progress} />

                    {status === "error" && error && (
                      <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3">
                        <p className="mb-3 text-xs text-rose-400">{error}</p>
                        <button
                          onClick={handleReset}
                          className="rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-xs text-zinc-300 transition-colors hover:bg-zinc-700"
                        >
                          try again
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Done view ── */}
                {view === "done" && (
                  <CompletionView results={results} onReset={handleReset} />
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Feature cards ────────────────────────────────────────────── */}
        <section id="about" className="px-4 pb-24">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-center text-3xl font-bold text-white md:text-4xl">
              how it works
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FeatureCard
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
                title="fully private"
                description="your files never leave your machine. ffmpeg.wasm runs entirely in the browser. no server, no cloud, no tracking."
              />
              <FeatureCard
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="23 7 16 12 23 17 23 7" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                }
                title="all codecs supported"
                description="encode to h.264, h.265/hevc, av1, or vp9. pick the right codec for your use case — compatibility, size, or quality."
              />
              <FeatureCard
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                }
                title="preset compression"
                description="one-click presets for web, social media, discord, and 4k archiving. or go custom and control every parameter."
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
