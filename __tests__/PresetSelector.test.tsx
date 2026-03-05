import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PresetSelector } from "@/components/PresetSelector";
import { PRESETS } from "@/lib/presets";

// ── Rendering ────────────────────────────────────────────────────────────────

describe("PresetSelector rendering", () => {
  it("renders a button for every preset", () => {
    render(<PresetSelector selectedId="web" onChange={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(PRESETS.length);
  });

  it("renders all preset labels", () => {
    render(<PresetSelector selectedId="web" onChange={vi.fn()} />);
    for (const preset of PRESETS) {
      expect(screen.getByText(preset.label)).toBeInTheDocument();
    }
  });

  it("renders all preset descriptions", () => {
    render(<PresetSelector selectedId="web" onChange={vi.fn()} />);
    for (const preset of PRESETS) {
      expect(screen.getByText(preset.description)).toBeInTheDocument();
    }
  });

  it("shows resolution and bitrate badges for non-custom presets", () => {
    render(<PresetSelector selectedId="web" onChange={vi.fn()} />);
    // web: 1920x1080 / 5M — social: 1920x1080 / 8M — discord: 1280x720 / 3M
    expect(screen.getAllByText("1920x1080")).toHaveLength(2); // web + social
    expect(screen.getByText("1280x720")).toBeInTheDocument();
    expect(screen.getByText("3840x2160")).toBeInTheDocument();
    expect(screen.getByText("5M")).toBeInTheDocument();
    expect(screen.getByText("8M")).toBeInTheDocument();
  });

  it("does not show resolution or bitrate badges for the custom preset", () => {
    render(<PresetSelector selectedId="custom" onChange={vi.fn()} />);
    const customBtn = screen.getByText("custom").closest("button")!;
    // custom preset has null resolution/bitrate — no badge text should appear inside it
    expect(customBtn).not.toHaveTextContent("1920x1080");
    expect(customBtn).not.toHaveTextContent("null");
  });
});

// ── Active state ──────────────────────────────────────────────────────────────

describe("PresetSelector active state", () => {
  it("applies rose accent class to the selected preset label", () => {
    render(<PresetSelector selectedId="discord" onChange={vi.fn()} />);
    const activeLabel = screen.getByText("discord");
    expect(activeLabel.className).toContain("rose");
  });

  it("does not apply rose accent to inactive preset labels", () => {
    render(<PresetSelector selectedId="web" onChange={vi.fn()} />);
    const inactiveLabel = screen.getByText("discord");
    expect(inactiveLabel.className).not.toContain("rose");
  });

  it("exactly one label carries the rose class", () => {
    render(<PresetSelector selectedId="social" onChange={vi.fn()} />);
    const labelEls = PRESETS.map((p) => screen.getByText(p.label));
    const roseLabels = labelEls.filter((el) => el.className.includes("rose"));
    expect(roseLabels).toHaveLength(1);
    expect(roseLabels[0].textContent).toBe("social");
  });
});

// ── Interactions ──────────────────────────────────────────────────────────────

describe("PresetSelector interactions", () => {
  it("calls onChange with the full preset object when a preset is clicked", () => {
    const onChange = vi.fn();
    render(<PresetSelector selectedId="web" onChange={onChange} />);

    fireEvent.click(screen.getByText("discord").closest("button")!);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "discord",
        resolution: "1280x720",
        bitrate: "3M",
      })
    );
  });

  it("passes the custom preset object (with null values) when custom is clicked", () => {
    const onChange = vi.fn();
    render(<PresetSelector selectedId="web" onChange={onChange} />);

    fireEvent.click(screen.getByText("custom").closest("button")!);

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "custom",
        resolution: null,
        bitrate: null,
      })
    );
  });

  it("all preset buttons are disabled when the disabled prop is set", () => {
    render(<PresetSelector selectedId="web" onChange={vi.fn()} disabled />);
    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });
});
