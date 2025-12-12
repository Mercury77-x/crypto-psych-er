import { Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="absolute bottom-0 left-0 right-0 py-6 text-center z-10">
      <p className="text-sm font-mono text-muted-foreground flex items-center justify-center gap-2">
        Designed by
        <a
          href="https://twitter.com/moqiuli77"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-secondary hover:text-secondary/80 transition-colors text-glow-subtle"
        >
          <Twitter className="w-4 h-4" />
          Mercury77 (@moqiuli77)
        </a>
      </p>
    </footer>
  )
}
