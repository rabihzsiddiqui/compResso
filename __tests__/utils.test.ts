import { describe, it, expect } from "vitest";
import {
  formatBytes,
  getExtension,
  CODEC_ENCODER_MAP,
  CODEC_CONTAINER_MAP,
} from "@/lib/utils";

// ── formatBytes ───────────────────────────────────────────────────────────────

describe("formatBytes", () => {
  it("formats values under 1 MB as whole KB", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(512 * 1024)).toBe("512 KB");
  });

  it("rounds KB values to the nearest integer", () => {
    // 1500 bytes → 1.46... KB → rounded to "1 KB"
    expect(formatBytes(1500)).toBe("1 KB");
  });

  it("formats exactly 1 MB as '1.0 MB'", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
  });

  it("formats values above 1 MB with one decimal place", () => {
    expect(formatBytes(5.5 * 1024 * 1024)).toBe("5.5 MB");
    expect(formatBytes(100 * 1024 * 1024)).toBe("100.0 MB");
  });

  it("treats values just under 1 MB as KB", () => {
    // 999 * 1024 = 1022976 bytes → (1022976 / 1024).toFixed(0) = "999 KB"
    expect(formatBytes(999 * 1024)).toBe("999 KB");
  });

  it("handles zero bytes", () => {
    expect(formatBytes(0)).toBe("0 KB");
  });
});

// ── getExtension ──────────────────────────────────────────────────────────────

describe("getExtension", () => {
  it("extracts a lowercase extension from a standard filename", () => {
    expect(getExtension("video.mp4")).toBe("mp4");
    expect(getExtension("clip.webm")).toBe("webm");
  });

  it("lowercases the extension", () => {
    expect(getExtension("video.MP4")).toBe("mp4");
    expect(getExtension("footage.MOV")).toBe("mov");
  });

  it("handles filenames with multiple dots and returns the last segment", () => {
    expect(getExtension("my.video.clip.mp4")).toBe("mp4");
    expect(getExtension("screen.recording.2024.mov")).toBe("mov");
  });

  it("returns the whole name when there is no dot", () => {
    // split(".").pop() returns the only element, not undefined
    expect(getExtension("nodot")).toBe("nodot");
  });

  it("handles dotfiles by returning the segment after the dot", () => {
    expect(getExtension(".gitignore")).toBe("gitignore");
  });
});

// ── CODEC_ENCODER_MAP ─────────────────────────────────────────────────────────

describe("CODEC_ENCODER_MAP", () => {
  it("maps h264 to libx264", () => {
    expect(CODEC_ENCODER_MAP.h264).toBe("libx264");
  });

  it("maps h265 to libx265", () => {
    expect(CODEC_ENCODER_MAP.h265).toBe("libx265");
  });

  it("maps av1 to libaom-av1", () => {
    expect(CODEC_ENCODER_MAP.av1).toBe("libaom-av1");
  });

  it("maps vp9 to libvpx-vp9", () => {
    expect(CODEC_ENCODER_MAP.vp9).toBe("libvpx-vp9");
  });

  it("covers exactly the four supported codecs", () => {
    const keys = Object.keys(CODEC_ENCODER_MAP).sort();
    expect(keys).toEqual(["av1", "h264", "h265", "vp9"]);
  });

  it("all encoder values are non-empty strings", () => {
    for (const encoder of Object.values(CODEC_ENCODER_MAP)) {
      expect(typeof encoder).toBe("string");
      expect(encoder.length).toBeGreaterThan(0);
    }
  });
});

// ── CODEC_CONTAINER_MAP ───────────────────────────────────────────────────────

describe("CODEC_CONTAINER_MAP", () => {
  it("h264 outputs mp4", () => {
    expect(CODEC_CONTAINER_MAP.h264).toBe("mp4");
  });

  it("h265 outputs mp4", () => {
    expect(CODEC_CONTAINER_MAP.h265).toBe("mp4");
  });

  it("av1 outputs webm", () => {
    expect(CODEC_CONTAINER_MAP.av1).toBe("webm");
  });

  it("vp9 outputs webm", () => {
    expect(CODEC_CONTAINER_MAP.vp9).toBe("webm");
  });

  it("covers exactly the four supported codecs", () => {
    const keys = Object.keys(CODEC_CONTAINER_MAP).sort();
    expect(keys).toEqual(["av1", "h264", "h265", "vp9"]);
  });

  it("only uses mp4 or webm as container values", () => {
    const containers = new Set(Object.values(CODEC_CONTAINER_MAP));
    expect([...containers].every((c) => c === "mp4" || c === "webm")).toBe(true);
  });
});
