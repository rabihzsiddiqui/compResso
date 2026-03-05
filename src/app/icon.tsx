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
          background: "linear-gradient(90deg, #e01010 0%, #ffb700 100%)",
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
    ),
    { ...size }
  );
}
