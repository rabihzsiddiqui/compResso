import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div style={{ flex: 1, background: "#9b0000" }} />
        <div style={{ flex: 1, background: "#fde047" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "white",
              lineHeight: 1,
              letterSpacing: "-0.5px",
            }}
          >
            c
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
