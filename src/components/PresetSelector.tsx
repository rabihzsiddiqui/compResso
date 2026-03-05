"use client";

import { PRESETS } from "@/lib/presets";
import type { Preset } from "@/types";

interface Props {
  selectedId: string;
  onChange: (preset: Preset) => void;
  disabled?: boolean;
}

export function PresetSelector({ selectedId, onChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      {PRESETS.map((preset) => {
        const active = selectedId === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onChange(preset)}
            disabled={disabled}
            className={[
              "w-full rounded-xl border px-4 py-3 text-left transition-all duration-200",
              "disabled:pointer-events-none disabled:opacity-40",
              active
                ? "border-rose-500/60 bg-rose-500/5 shadow-lg shadow-rose-500/10"
                : "border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              {/* Label + description */}
              <div className="min-w-0">
                <p
                  className={[
                    "text-sm font-semibold",
                    active ? "text-rose-400" : "text-white",
                  ].join(" ")}
                >
                  {preset.label}
                </p>
                <p className="mt-0.5 truncate text-xs text-zinc-400">
                  {preset.description}
                </p>
              </div>

              {/* Badges — hidden for custom */}
              {preset.id !== "custom" && (
                <div className="flex shrink-0 items-center gap-1.5">
                  {preset.resolution && (
                    <span className="rounded bg-zinc-700/60 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                      {preset.resolution}
                    </span>
                  )}
                  {preset.bitrate && (
                    <span className="rounded bg-zinc-700/60 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                      {preset.bitrate}
                    </span>
                  )}
                </div>
              )}

              {/* Custom — just an icon cue */}
              {preset.id === "custom" && (
                <svg
                  className="shrink-0 text-zinc-500"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
