"use client";

import html2canvas from "html2canvas";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const vintageRef = useRef<HTMLDivElement>(null);

  const handleUpload = async () => {
    if (!file) {
      setError("请先选择 CSV 文件");
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const resp = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data?.detail || "上传失败，请稍后再试");
      }

      const result = await resp.json();
      const reportText = typeof result?.report === "string" ? result.report : "";
      setReport(reportText);
      if (typeof window !== "undefined") {
        localStorage.setItem("analysis_result", JSON.stringify(result));
      }

      startTransition(() => {
        router.push("/report");
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!vintageRef.current) return;
    const canvas = await html2canvas(vintageRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    });
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "diagnosis.png";
    link.click();
  };

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <HeroSection />

      <section className="mx-auto mt-12 w-full max-w-3xl px-6 pb-16">
        <div className="rounded-2xl border bg-card/70 p-6 shadow-sm">
          <h2 className="text-xl font-semibold">上传交易 CSV</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            支持 CSV 文件，上传后将自动生成分析报告。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="flex-1 text-sm file:mr-3 file:rounded-md file:border file:border-input file:bg-background file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-accent hover:file:text-accent-foreground"
            />
            <Button
              type="button"
              onClick={handleUpload}
              disabled={isPending || isLoading}
              className="w-full sm:w-auto"
            >
              {isPending || isLoading ? "上传中..." : "上传并查看报告"}
            </Button>
          </div>
          {error ? (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          ) : null}
          {report ? (
            <div className="mt-6 rounded-xl border bg-background/70 p-4">
              <h3 className="text-base font-semibold">实时结果</h3>
              <div className="prose prose-sm dark:prose-invert mt-3">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
            </div>
          ) : null}
          <div className="mt-4 flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateImage}
              disabled={!report}
            >
              生成分享图片
            </Button>
          </div>
        </div>
      </section>

      <div
        ref={vintageRef}
        className="pointer-events-none absolute -left-[9999px] top-0 w-[800px] max-w-full bg-[#f8e7b9] p-8 text-[#3b2a1a]"
        style={{
          fontFamily: '"Courier New", ui-monospace, SFMono-Regular, Menlo, Monaco',
          border: "2px solid #d2b48c",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          position: "absolute",
        }}
      >
        <div className="flex items-center justify-between border-b border-[#d2b48c] pb-4">
          <div>
            <p className="text-lg font-bold tracking-wide">币圈精神病院</p>
            <p className="text-sm">确诊通知书</p>
          </div>
          <span
            style={{
              color: "#b91c1c",
              border: "2px solid #b91c1c",
              padding: "4px 10px",
              transform: "rotate(-10deg)",
              display: "inline-block",
              fontWeight: 700,
            }}
          >
            已确诊
          </span>
        </div>
        <div className="mt-4 text-sm leading-6">
          <p>患者代号：匿名交易者</p>
          <p>诊断科室：情绪与风险管理科</p>
          <p>主治医师：Dr. Gemini</p>
        </div>
        <div className="mt-6 rounded border border-dashed border-[#b78c4a] bg-[#f4dc9a] p-4">
          <p className="mb-2 text-sm font-semibold">诊断摘录：</p>
          <div className="whitespace-pre-wrap text-sm">
            {report || "等待生成报告..."}
          </div>
        </div>
        <div className="mt-6 text-xs text-[#5b432e]">
          <p>警告：请按医嘱执行，避免复发。</p>
          <p>备注：本通知书仅供受害者本人查阅，禁止外传。</p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
