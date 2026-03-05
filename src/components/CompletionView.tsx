"use client";

import type { CompressResult } from "@/types";

interface FileResult {
  original: File;
  result: CompressResult;
}

interface Props {
  results: FileResult[];
  onReset: () => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function savingsPct(original: number, compressed: number): number {
  return Math.round(((original - compressed) / original) * 100);
}

function getMimeType(filename: string): string {
  return filename.endsWith(".webm") ? "video/webm" : "video/mp4";
}

function downloadResult(result: CompressResult) {
  const blob = new Blob([result.data], { type: getMimeType(result.filename) });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = result.filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadAll(results: FileResult[]) {
  // Stagger downloads slightly so browsers don't block them
  results.forEach(({ result }, i) => {
    setTimeout(() => downloadResult(result), i * 150);
  });
}

export function CompletionView({ results, onReset }: Props) {
  const totalOriginal = results.reduce((s, r) => s + r.original.size, 0);
  const totalCompressed = results.reduce((s, r) => s + r.result.size, 0);
  const totalSavings = savingsPct(totalOriginal, totalCompressed);

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="flex flex-col items-center gap-3 pt-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-white">done</p>
          <p className="text-sm text-zinc-400">
            {results.length === 1
              ? "your file is ready"
              : `${results.length} files compressed`}
            {totalSavings > 0 && (
              <span className="ml-1 text-rose-400">
                — {totalSavings}% smaller overall
              </span>
            )}
          </p>
        </div>
      </div>

      {/* File results table */}
      <div className="overflow-hidden rounded-xl border border-zinc-700/50">
        {/* Header */}
        <div className="grid grid-cols-4 gap-3 border-b border-zinc-700/50 bg-zinc-800/60 px-4 py-2">
          <span className="col-span-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            file
          </span>
          <span className="text-right text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            original
          </span>
          <span className="text-right text-[10px] font-medium uppercase tracking-wider text-zinc-500">
            compressed
          </span>
        </div>

        {/* Rows */}
        {results.map(({ original, result }, i) => {
          const pct = savingsPct(original.size, result.size);
          return (
            <div
              key={i}
              className={[
                "grid grid-cols-4 gap-3 px-4 py-3 items-center",
                i < results.length - 1 ? "border-b border-zinc-800" : "",
              ].join(" ")}
            >
              {/* Name + savings badge */}
              <div className="col-span-2 flex items-center gap-2 min-w-0">
                <span className="truncate text-sm text-zinc-300">
                  {original.name}
                </span>
                {pct > 0 && (
                  <span className="shrink-0 rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400">
                    -{pct}%
                  </span>
                )}
              </div>
              <span className="text-right font-mono text-xs text-zinc-500">
                {formatBytes(original.size)}
              </span>
              <div className="flex items-center justify-end gap-2">
                <span className="font-mono text-xs text-zinc-300">
                  {formatBytes(result.size)}
                </span>
                {/* Individual download */}
                <button
                  onClick={() => downloadResult(result)}
                  className="shrink-0 rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-700 hover:text-zinc-300"
                  aria-label="download"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 rounded-full border border-zinc-700 bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          compress more
        </button>
        <button
          onClick={() => downloadAll(results)}
          className="flex-1 rounded-full bg-rose-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-rose-400 hover:scale-105"
        >
          download{results.length > 1 ? " all" : ""}
        </button>
      </div>
    </div>
  );
}
