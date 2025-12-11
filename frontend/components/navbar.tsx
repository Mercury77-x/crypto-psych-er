import Link from "next/link";

export function Navbar() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-base font-semibold">
          币圈精神科
        </Link>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          GitHub
        </a>
      </div>
    </header>
  );
}

