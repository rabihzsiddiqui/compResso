import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FileDropZone } from "@/components/FileDropZone";

// Build a FileList-like object that satisfies Array.from() in the component's
// handleFiles function.
function makeFileList(files: File[]): FileList {
  return Object.assign(files, {
    item: (i: number) => files[i] ?? null,
  }) as unknown as FileList;
}

function makeFile(name: string, type: string, sizeBytes = 2 * 1024 * 1024): File {
  // File constructor doesn't honour the size option in jsdom, so we patch it.
  const file = new File(["x".repeat(10)], name, { type });
  Object.defineProperty(file, "size", { value: sizeBytes });
  return file;
}

// ── Rendering ────────────────────────────────────────────────────────────────

describe("FileDropZone rendering", () => {
  it("renders the drop prompt text", () => {
    render(<FileDropZone files={[]} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(/drop videos here/i)).toBeInTheDocument();
    expect(screen.getByText("browse")).toBeInTheDocument();
  });

  it("renders the accepted format hint", () => {
    render(<FileDropZone files={[]} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText(/mp4.*webm/i)).toBeInTheDocument();
  });

  it("does not render a file list when files is empty", () => {
    const { container } = render(
      <FileDropZone files={[]} onAdd={vi.fn()} onRemove={vi.fn()} />
    );
    expect(container.querySelector("ul")).toBeNull();
  });

  it("renders a list item for each file in the files prop", () => {
    const files = [
      makeFile("a.mp4", "video/mp4"),
      makeFile("b.webm", "video/webm"),
    ];
    render(<FileDropZone files={files} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("a.mp4")).toBeInTheDocument();
    expect(screen.getByText("b.webm")).toBeInTheDocument();
  });

  it("shows the correct lowercase extension badge for each file", () => {
    const files = [makeFile("clip.MP4", "video/mp4")];
    render(<FileDropZone files={files} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("mp4")).toBeInTheDocument();
  });

  it("shows formatted file size for each file", () => {
    // 3 MB file
    const files = [makeFile("big.mp4", "video/mp4", 3 * 1024 * 1024)];
    render(<FileDropZone files={files} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getByText("3.0 MB")).toBeInTheDocument();
  });

  it("renders a remove button for each file", () => {
    const files = [
      makeFile("a.mp4", "video/mp4"),
      makeFile("b.mp4", "video/mp4"),
    ];
    render(<FileDropZone files={files} onAdd={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.getAllByLabelText("remove file")).toHaveLength(2);
  });
});

// ── Interactions ──────────────────────────────────────────────────────────────

describe("FileDropZone interactions", () => {
  it("calls onRemove with the correct index when a remove button is clicked", () => {
    const files = [
      makeFile("first.mp4", "video/mp4"),
      makeFile("second.mp4", "video/mp4"),
    ];
    const onRemove = vi.fn();
    render(<FileDropZone files={files} onAdd={vi.fn()} onRemove={onRemove} />);

    const removeButtons = screen.getAllByLabelText("remove file");
    fireEvent.click(removeButtons[1]);
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it("calls onAdd with only video/* files when dropped", () => {
    const onAdd = vi.fn();
    render(<FileDropZone files={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    const videoFile = makeFile("clip.mp4", "video/mp4");
    const textFile = makeFile("notes.txt", "text/plain");

    const dropZone = screen.getByRole("button");
    fireEvent.drop(dropZone, {
      dataTransfer: { files: makeFileList([videoFile, textFile]) },
    });

    expect(onAdd).toHaveBeenCalledWith([videoFile]);
  });

  it("does not call onAdd when only non-video files are dropped", () => {
    const onAdd = vi.fn();
    render(<FileDropZone files={[]} onAdd={onAdd} onRemove={vi.fn()} />);

    const dropZone = screen.getByRole("button");
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: makeFileList([makeFile("doc.pdf", "application/pdf")]),
      },
    });

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("does not call onAdd when disabled and files are dropped", () => {
    const onAdd = vi.fn();
    render(<FileDropZone files={[]} onAdd={onAdd} onRemove={vi.fn()} disabled />);

    const dropZone = screen.getByRole("button");
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: makeFileList([makeFile("clip.mp4", "video/mp4")]),
      },
    });

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("remove buttons are disabled when the disabled prop is set", () => {
    const files = [makeFile("a.mp4", "video/mp4")];
    render(
      <FileDropZone files={files} onAdd={vi.fn()} onRemove={vi.fn()} disabled />
    );
    const removeBtn = screen.getByLabelText("remove file");
    expect(removeBtn).toBeDisabled();
  });
});
