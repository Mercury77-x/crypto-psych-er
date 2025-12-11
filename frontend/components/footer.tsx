export function Footer() {
  return (
    <footer className="border-t bg-background/60 px-6 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="font-medium text-foreground">Crypto Psychiatrist</p>
        <div className="flex flex-wrap gap-4">
          <a className="hover:text-foreground" href="mailto:hello@example.com">
            联系我们
          </a>
          <a className="hover:text-foreground" href="#">
            隐私政策
          </a>
          <a className="hover:text-foreground" href="#">
            使用条款
          </a>
        </div>
      </div>
    </footer>
  );
}

