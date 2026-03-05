import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-sm font-semibold text-white">
          compResso<span className="text-rose-500">.</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
          >
            home
          </Link>
          <Link
            href="/about"
            className="text-sm text-zinc-400 transition-colors duration-200 hover:text-white"
          >
            about
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-medium text-white transition-all duration-200 hover:bg-rose-500 hover:scale-105"
          >
            view source
          </a>
        </nav>
      </div>
    </header>
  );
}
