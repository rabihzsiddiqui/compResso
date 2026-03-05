"use client";

import { useEffect, useRef } from "react";
import type { FFmpegStatus } from "@/types";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function getStage(status: FFmpegStatus, progress: number): string {
  if (status === "loading") return "loading ffmpeg wasm";
  if (status === "compressing") {
    if (progress < 5) return "analyzing input";
    if (progress < 95) return "compressing";
    return "finalizing";
  }
  return "";
}

interface Props {
  status: FFmpegStatus;
  progress: number;
  /** optional live log lines from ffmpeg.on("log") */
  logs?: string[];
  /** the ffmpeg command being run, shown at top of terminal */
  command?: string;
}

export function ProgressDisplay({ status, progress, logs, command }: Props) {
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal to latest line
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const clamped = Math.min(100, Math.max(0, progress));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);
  const stage = getStage(status, progress);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width="140"
          height="140"
          viewBox="0 0 120 120"
          className="-rotate-90"
        >
          {/* Track */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-800"
          />
          {/* Progress */}
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-300 ease-out"
          />
        </svg>

        {/* Center text — rotated back upright */}
        <div className="absolute flex flex-col items-center">
          <span className="font-mono text-2xl font-semibold text-white">
            {clamped}
            <span className="text-sm text-zinc-400">%</span>
          </span>
        </div>
      </div>

      {/* Stage label */}
      <div className="flex items-center gap-2">
        {/* Animated pulse dot */}
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
        </span>
        <span className="text-sm text-zinc-400">{stage}</span>
      </div>

      {/* Terminal box */}
      <div className="w-full rounded-lg border border-zinc-700/50 bg-zinc-900 p-4">
        <div className="mb-2 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
          <span className="ml-2 text-[10px] text-zinc-600">ffmpeg output</span>
        </div>

        <div className="h-32 overflow-y-auto font-mono text-[11px] leading-relaxed">
          {command && (
            <p className="text-zinc-500">
              <span className="text-rose-500/70">$</span> {command}
            </p>
          )}
          {logs && logs.length > 0 ? (
            logs.map((line, i) => (
              <p key={i} className="text-zinc-400">
                {line}
              </p>
            ))
          ) : (
            <p className="text-zinc-600 italic">
              {status === "loading"
                ? "downloading ffmpeg core from cdn..."
                : status === "compressing"
                ? "encoding in progress..."
                : "waiting..."}
            </p>
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
