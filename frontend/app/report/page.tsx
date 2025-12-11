"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

type AnalysisResult = {
  report?: string;
  raw_data?: unknown;
  [key: string]: unknown;
};

export default function ReportPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("analysis_result");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AnalysisResult;
        setData(parsed);
      } catch {
        setData(null);
      }
    }
  }, []);

  const handleBack = () => {
    router.push("/");
  };

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">分析报告</h1>
          <Button variant="outline" onClick={handleBack}>
            返回首页
          </Button>
        </div>

        {!data ? (
          <div className="rounded-2xl border bg-card/70 p-8 text-center shadow-sm">
            <p className="text-base text-muted-foreground">
              未找到报告数据，请先上传 CSV。
            </p>
            <Button className="mt-4" onClick={handleBack}>
              请先上传
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card/70 p-6 shadow-sm">
              <h2 className="text-lg font-semibold">报告内容</h2>
              <div className="prose prose-sm dark:prose-invert mt-3">
                <ReactMarkdown>{data.report ?? "暂无报告文本"}</ReactMarkdown>
              </div>
            </div>

            <div className="rounded-2xl border bg-card/70 p-6 shadow-sm">
              <h3 className="text-base font-semibold">原始数据</h3>
              <pre className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
                {JSON.stringify(data.raw_data ?? data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

