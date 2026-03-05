"use client";

import { useRef, useState, useCallback } from "react";
import { formatBytes, getExtension } from "@/lib/utils";

interface Props {
  files: File[];
  onAdd: (newFiles: File[]) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

export function FileDropZone({ files, onAdd, onRemove, disabled }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const videos = Array.from(incoming).filter((f) =>
        f.type.startsWith("video/")
      );
      if (videos.length) onAdd(videos);
    },
    [onAdd]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    // Only clear if we actually left the zone (not a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragging(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) handleFiles(e.dataTransfer.files);
  };

  const onClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        onClick={onClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={[
          "relative flex flex-col items-center justify-center gap-3",
          "rounded-xl border-2 border-dashed p-10 text-center",
          "transition-all duration-200 cursor-pointer select-none",
          disabled
            ? "pointer-events-none opacity-40 border-zinc-700"
            : dragging
            ? "border-rose-500 bg-rose-500/5 shadow-lg shadow-rose-500/10"
            : "border-zinc-700/70 hover:border-zinc-600 hover:bg-zinc-800/30",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          multiple
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div
          className={[
            "flex h-12 w-12 items-center justify-center rounded-full",
            "transition-colors duration-200",
            dragging ? "bg-rose-500/15" : "bg-zinc-800",
          ].join(" ")}
        >
          <svg
            className={dragging ? "text-rose-400" : "text-zinc-500"}
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div>
          <p className="text-sm font-medium text-white">
            drop videos here
            <span className="mx-1 font-normal text-zinc-500">or</span>
            <span className="text-rose-400">browse</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">mp4, mov, webm, mkv, avi...</p>
        </div>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 px-4 py-3"
            >
              {/* Extension badge */}
              <span className="shrink-0 rounded bg-rose-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-rose-400">
                {getExtension(file.name)}
              </span>

              {/* Name */}
              <span className="flex-1 truncate text-sm text-zinc-300">
                {file.name}
              </span>

              {/* Size */}
              <span className="shrink-0 text-xs text-zinc-500">
                {formatBytes(file.size)}
              </span>

              {/* Remove */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(i);
                }}
                disabled={disabled}
                className="shrink-0 rounded p-1 text-zinc-600 transition-colors hover:bg-zinc-700 hover:text-zinc-300 disabled:pointer-events-none"
                aria-label="remove file"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
