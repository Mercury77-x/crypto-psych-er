import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-b from-background via-background to-muted/40 px-6 py-24 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm font-medium text-muted-foreground ring-1 ring-border">
          AI 心理报告 · 私密安全
        </p>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
          上传你的对话记录，获取个性化情绪洞察
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          本工具会分析情绪波动、潜在压力源，并生成可执行的心理建议。数据仅本地处理，可随时删除。
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/report">查看报告</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#how-it-works">了解流程</Link>
          </Button>
        </div>
      </div>
      <div
        id="how-it-works"
        className="mx-auto mt-16 grid max-w-4xl gap-6 rounded-2xl border bg-card/50 p-8 shadow-sm sm:grid-cols-3"
      >
        <Feature
          title="快速上传"
          description="支持文本或文件，自动清洗格式并保护隐私。"
        />
        <Feature
          title="多维分析"
          description="情绪曲线、压力来源、应对建议一目了然。"
        />
        <Feature
          title="随时导出"
          description="生成摘要或完整报告，方便留档或分享。"
        />
      </div>
    </section>
  );
}

function Feature({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-background/60 p-4 text-left shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

