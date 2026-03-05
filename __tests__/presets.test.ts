import { describe, it, expect } from "vitest";
import { PRESETS, bitrateForSize, getPreset } from "@/lib/presets";

const VALID_CODECS = ["h264", "h265", "av1", "vp9"];
const RESOLUTION_RE = /^\d+x\d+$/;
const BITRATE_RE = /^\d+M$/;

// ── PRESETS array ────────────────────────────────────────────────────────────

describe("PRESETS", () => {
  it("contains exactly 5 presets", () => {
    expect(PRESETS).toHaveLength(5);
  });

  it("all preset ids are unique", () => {
    const ids = PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every preset has a non-empty id, label, and description", () => {
    for (const preset of PRESETS) {
      expect(preset.id.length).toBeGreaterThan(0);
      expect(preset.label.length).toBeGreaterThan(0);
      expect(preset.description.length).toBeGreaterThan(0);
    }
  });

  it("every preset uses a valid codec", () => {
    for (const preset of PRESETS) {
      expect(VALID_CODECS).toContain(preset.codec);
    }
  });

  it("every preset has a CRF in the valid range 18–42", () => {
    for (const preset of PRESETS) {
      expect(preset.crf).toBeGreaterThanOrEqual(18);
      expect(preset.crf).toBeLessThanOrEqual(42);
    }
  });

  it("non-custom presets have a resolution in WxH format", () => {
    const defined = PRESETS.filter((p) => p.id !== "custom");
    for (const preset of defined) {
      expect(preset.resolution).not.toBeNull();
      expect(preset.resolution).toMatch(RESOLUTION_RE);
    }
  });

  it("non-custom presets have a bitrate ending in M", () => {
    const defined = PRESETS.filter((p) => p.id !== "custom");
    for (const preset of defined) {
      expect(preset.bitrate).not.toBeNull();
      expect(preset.bitrate).toMatch(BITRATE_RE);
    }
  });

  it("custom preset has null resolution and bitrate", () => {
    const custom = PRESETS.find((p) => p.id === "custom");
    expect(custom).toBeDefined();
    expect(custom!.resolution).toBeNull();
    expect(custom!.bitrate).toBeNull();
  });

  it("web preset targets 1080p at 5M", () => {
    const web = PRESETS.find((p) => p.id === "web");
    expect(web!.resolution).toBe("1920x1080");
    expect(web!.bitrate).toBe("5M");
  });

  it("social preset targets higher bitrate than web", () => {
    const web = PRESETS.find((p) => p.id === "web")!;
    const social = PRESETS.find((p) => p.id === "social")!;
    const webBits = parseInt(web.bitrate!);
    const socialBits = parseInt(social.bitrate!);
    expect(socialBits).toBeGreaterThan(webBits);
  });

  it("discord preset targets 720p", () => {
    const discord = PRESETS.find((p) => p.id === "discord");
    expect(discord!.resolution).toBe("1280x720");
  });

  it("archive preset targets 4K at 20M", () => {
    const archive = PRESETS.find((p) => p.id === "archive");
    expect(archive!.resolution).toBe("3840x2160");
    expect(archive!.bitrate).toBe("20M");
  });

  it("archive preset has the lowest CRF (highest quality)", () => {
    const crfs = PRESETS.filter((p) => p.id !== "custom").map((p) => p.crf);
    const archive = PRESETS.find((p) => p.id === "archive")!;
    expect(archive.crf).toBe(Math.min(...crfs));
  });
});

// ── getPreset ─────────────────────────────────────────────────────────────────

describe("getPreset", () => {
  it("returns the correct preset for each known id", () => {
    for (const preset of PRESETS) {
      const found = getPreset(preset.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(preset.id);
    }
  });

  it("returns undefined for an unknown id", () => {
    expect(getPreset("unknown")).toBeUndefined();
    expect(getPreset("")).toBeUndefined();
  });
});

// ── bitrateForSize ────────────────────────────────────────────────────────────

describe("bitrateForSize", () => {
  it("returns 1000 when duration is zero", () => {
    expect(bitrateForSize(25, 0)).toBe(1000);
  });

  it("returns 1000 when duration is negative", () => {
    expect(bitrateForSize(25, -30)).toBe(1000);
  });

  it("calculates bitrate correctly for 25 MB over 60 seconds", () => {
    // 25 * 8 * 1024 = 204800 kbits / 60s = floor(3413) − 128 audio = 3285
    expect(bitrateForSize(25, 60)).toBe(3285);
  });

  it("never returns below 100 kbps for very long durations", () => {
    expect(bitrateForSize(1, 100_000)).toBe(100);
  });

  it("subtracts the audio kbps from the calculated bitrate", () => {
    const withDefault = bitrateForSize(25, 60, 128);
    const withHighAudio = bitrateForSize(25, 60, 256);
    expect(withHighAudio).toBe(withDefault - 128);
  });

  it("scales linearly with file size target", () => {
    const small = bitrateForSize(10, 60);
    const large = bitrateForSize(20, 60);
    expect(large).toBeGreaterThan(small);
  });

  it("scales inversely with duration", () => {
    const short = bitrateForSize(25, 30);
    const long = bitrateForSize(25, 120);
    expect(short).toBeGreaterThan(long);
  });
});
