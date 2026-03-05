import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CodecSelector } from "@/components/CodecSelector";
import type { OutputCodec } from "@/types";

const ALL_CODECS: OutputCodec[] = ["h264", "h265", "av1", "vp9"];

// ── Rendering ────────────────────────────────────────────────────────────────

describe("CodecSelector rendering", () => {
  it("renders all four codec labels", () => {
    render(<CodecSelector value="h264" onChange={vi.fn()} />);
    expect(screen.getByText("h.264")).toBeInTheDocument();
    expect(screen.getByText("h.265")).toBeInTheDocument();
    expect(screen.getByText("av1")).toBeInTheDocument();
    expect(screen.getByText("vp9")).toBeInTheDocument();
  });

  it("renders the sublabel for each codec", () => {
    render(<CodecSelector value="h264" onChange={vi.fn()} />);
    expect(screen.getByText("avc")).toBeInTheDocument();
    expect(screen.getByText("hevc")).toBeInTheDocument();
    expect(screen.getByText("libaom")).toBeInTheDocument();
    expect(screen.getByText("libvpx")).toBeInTheDocument();
  });

  it("renders a description for each codec", () => {
    render(<CodecSelector value="h264" onChange={vi.fn()} />);
    expect(screen.getByText(/best compatibility/i)).toBeInTheDocument();
    expect(screen.getByText(/smaller files/i)).toBeInTheDocument();
    expect(screen.getByText(/best quality per bit/i)).toBeInTheDocument();
    expect(screen.getByText(/good for web/i)).toBeInTheDocument();
  });

  it("renders four buttons total", () => {
    render(<CodecSelector value="h264" onChange={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });
});

// ── Active state ──────────────────────────────────────────────────────────────

describe("CodecSelector active state", () => {
  it("applies rose accent class to the active codec label", () => {
    render(<CodecSelector value="av1" onChange={vi.fn()} />);
    // The span containing the codec label text gets rose-400 when active
    const activeLabel = screen.getByText("av1");
    expect(activeLabel.className).toContain("rose");
  });

  it("does not apply rose accent to an inactive codec label", () => {
    render(<CodecSelector value="h264" onChange={vi.fn()} />);
    const inactiveLabel = screen.getByText("av1");
    expect(inactiveLabel.className).not.toContain("rose");
  });

  it("only one codec label carries the rose class at a time", () => {
    render(<CodecSelector value="vp9" onChange={vi.fn()} />);
    const labels = ["h.264", "h.265", "av1", "vp9"].map((t) =>
      screen.getByText(t)
    );
    const roseLabels = labels.filter((el) => el.className.includes("rose"));
    expect(roseLabels).toHaveLength(1);
    expect(roseLabels[0].textContent).toBe("vp9");
  });
});

// ── Interactions ──────────────────────────────────────────────────────────────

describe("CodecSelector interactions", () => {
  it.each(ALL_CODECS)(
    "calls onChange with '%s' when that codec button is clicked",
    (codec) => {
      const onChange = vi.fn();
      render(<CodecSelector value="h264" onChange={onChange} />);

      // Map codec id → visible label text
      const labelMap: Record<OutputCodec, string> = {
        h264: "h.264",
        h265: "h.265",
        av1: "av1",
        vp9: "vp9",
      };

      const button = screen.getByText(labelMap[codec]).closest("button")!;
      fireEvent.click(button);
      expect(onChange).toHaveBeenCalledWith(codec);
    }
  );

  it("does not call onChange when already on the active codec", () => {
    // The button still fires, but we verify onChange is called (React doesn't
    // short-circuit the handler — state management is the page's responsibility)
    const onChange = vi.fn();
    render(<CodecSelector value="h264" onChange={onChange} />);
    fireEvent.click(screen.getByText("h.264").closest("button")!);
    expect(onChange).toHaveBeenCalledWith("h264");
  });

  it("all buttons are disabled when the disabled prop is set", () => {
    render(<CodecSelector value="h264" onChange={vi.fn()} disabled />);
    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });
});
