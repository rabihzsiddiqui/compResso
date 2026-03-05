import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "about",
  description:
    "learn about compresso — browser-based video compression using ffmpeg.wasm.",
};

const STACK = [
  {
    name: "next.js 16",
    detail: "app router, typescript, static generation",
  },
  {
    name: "ffmpeg.wasm",
    detail: "@ffmpeg/ffmpeg 0.12 — runs ffmpeg in the browser via webassembly",
  },
  {
    name: "tailwind css v4",
    detail: "utility-first styling with custom design tokens",
  },
  {
    name: "vitest",
    detail: "unit and component testing with @testing-library/react",
  },
];

export default function About() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 pb-24 pt-36">
        {/* Heading */}
        <h1 className="mb-6 text-3xl font-bold text-white md:text-4xl">
          about compResso<span className="text-rose-500">.</span>
        </h1>

        {/* Description */}
        <div className="space-y-4 text-base leading-relaxed text-zinc-400">
          <p>
            compresso is a browser-based video compression tool. drop in a video
            file, pick a codec and quality level, and get a smaller file back.
            the whole thing runs locally — ffmpeg.wasm processes your video
            directly in the browser using webassembly.
          </p>
          <p>
            no file ever leaves your device. there is no server, no cloud
            storage, and no account. once ffmpeg.wasm is loaded (from cdn the
            first time), it works entirely offline.
          </p>
        </div>

        {/* Divider */}
        <div className="my-10 border-t border-zinc-800/60" />

        {/* Why section */}
        <h2 className="mb-4 text-lg font-semibold text-white">why it exists</h2>
        <p className="mb-8 text-base leading-relaxed text-zinc-400">
          most video tools either upload your file to a server or require
          installing software. compresso does neither. it is a single web page
          that compresses video privately and directly, in whatever browser you
          have open.
        </p>

        {/* Divider */}
        <div className="mb-10 border-t border-zinc-800/60" />

        {/* Tech stack */}
        <h2 className="mb-6 text-lg font-semibold text-white">tech stack</h2>
        <ul className="space-y-3">
          {STACK.map((item) => (
            <li
              key={item.name}
              className="flex flex-col gap-0.5 rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-3"
            >
              <span className="shrink-0 text-sm font-semibold text-white">
                {item.name}
              </span>
              <span className="text-xs text-zinc-500">{item.detail}</span>
            </li>
          ))}
        </ul>

        {/* Divider */}
        <div className="my-10 border-t border-zinc-800/60" />

        {/* Browser compatibility */}
        <h2 className="mb-4 text-lg font-semibold text-white">
          browser compatibility
        </h2>
        <p className="mb-3 text-base leading-relaxed text-zinc-400">
          compresso requires{" "}
          <code className="rounded bg-zinc-700/60 px-1.5 py-0.5 font-mono text-xs text-zinc-300">
            SharedArrayBuffer
          </code>
          , which is only available in cross-origin isolated contexts. the
          correct COOP/COEP headers are set automatically.
        </p>
        <p className="text-sm text-zinc-500">
          works in chrome 92+, firefox 79+, and safari 15.2+. safari on ios
          requires ios 15.2 or later.
        </p>

        {/* Divider */}
        <div className="my-10 border-t border-zinc-800/60" />

        {/* Back link */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full bg-rose-600 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:bg-rose-500 hover:scale-105"
          >
            try compresso
          </Link>
          <a
            href="https://github.com/rabihzsiddiqui/compResso"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-zinc-700 bg-zinc-800 px-6 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            view source
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
