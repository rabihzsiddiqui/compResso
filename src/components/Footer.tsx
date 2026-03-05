import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              compResso<span className="text-rose-500">.</span>
            </p>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-zinc-500">
              browser-based video compression powered by ffmpeg.wasm. nothing
              leaves your device.
            </p>
          </div>

          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              home
            </Link>
            <Link
              href="/about"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              about
            </Link>
            <a
              href="https://github.com/rabihzsiddiqui/compResso"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              view source
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t border-zinc-800/60 pt-6">
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} compresso. all processing runs locally
            in your browser.{" "}
            <a
              href="https://rabihs.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
            >
              built by rabih.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
