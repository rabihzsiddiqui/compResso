import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | compresso",
    default: "compresso — browser-based video compression",
  },
  description:
    "compress video files locally in your browser using ffmpeg.wasm. no uploads, no tracking. h.264, h.265, av1, and vp9 support.",
  keywords: [
    "video compression", "ffmpeg", "ffmpeg.wasm", "browser",
    "h264", "h265", "av1", "vp9", "privacy", "offline",
  ],
  openGraph: {
    title: "compresso",
    description:
      "compress video files locally in your browser. no uploads, no tracking.",
    type: "website",
    siteName: "compresso",
  },
  twitter: {
    card: "summary_large_image",
    title: "compresso",
    description: "browser-based video compression. no uploads, no tracking.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-geist-sans)] antialiased`}
      >
        {/* Smoky amber background glows */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-[600px] w-[700px] -translate-x-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[500px] rounded-full bg-amber-600/8 blur-[100px]" />
        </div>
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
