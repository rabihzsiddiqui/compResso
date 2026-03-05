"use client";

import type { OutputCodec } from "@/types";

interface CodecOption {
  id: OutputCodec;
  label: string;
  sublabel: string;
  description: string;
}

const CODECS: CodecOption[] = [
  {
    id: "h264",
    label: "h.264",
    sublabel: "avc",
    description: "best compatibility — works on every device and platform",
  },
  {
    id: "h265",
    label: "h.265",
    sublabel: "hevc",
    description: "smaller files with wide support — hardware decode on modern devices",
  },
  {
    id: "av1",
    label: "av1",
    sublabel: "libaom",
    description: "best quality per bit — open standard, encode is slow",
  },
  {
    id: "vp9",
    label: "vp9",
    sublabel: "libvpx",
    description: "good for web and youtube — open codec, broad browser support",
  },
];

interface Props {
  value: OutputCodec;
  onChange: (codec: OutputCodec) => void;
  disabled?: boolean;
}

export function CodecSelector({ value, onChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {CODECS.map((codec) => {
        const active = value === codec.id;
        return (
          <button
            key={codec.id}
            onClick={() => onChange(codec.id)}
            disabled={disabled}
            className={[
              "rounded-xl border p-4 text-left transition-all duration-200",
              "disabled:pointer-events-none disabled:opacity-40",
              active
                ? "border-rose-500/60 bg-rose-500/5 shadow-lg shadow-rose-500/10"
                : "border-zinc-700/50 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800",
            ].join(" ")}
          >
            <div className="flex items-baseline gap-1.5">
              <span
                className={[
                  "text-sm font-semibold",
                  active ? "text-rose-400" : "text-white",
                ].join(" ")}
              >
                {codec.label}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                {codec.sublabel}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              {codec.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
