"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { DiagnosisCard } from "@/components/DiagnosisCard";

type CertificateData = {
  patient_id: string;
  diagnosis: string;
  tags: string[];
  doctor_advice: string;
};

type AnalysisResult = {
  report?: string;
  [key: string]: unknown; // 兼容其它字段
};

export default function ReportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [reportText, setReportText] = useState<string>("");
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("analysisData");
    if (!stored) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as AnalysisResult;
      let fullReport = parsed.report ?? "";

      // 寻找 "[4. 币圈精神病确诊通知书]" 小节的代码块(JSON)
      // 假定格式如下：
      // ...[4. 币圈精神病确诊通知书]
      // ```json
      // { ... }
      // ```
      // (section 后跟随可能的文本/空行/代码块)

      // 1. 定位小节 [4. 币圈精神病确诊通知书]（支持多种格式）
      // 匹配: ### [4. 币圈精神病确诊通知书] 或 ## 4. 币圈精神病确诊通知书 等
      const secTitle = /(?:^|\n)(?:#{1,6}\s*)?\[?4[.、．]?\s*币圈精神病确诊通知书\]?/m;
      const secMatch = secTitle.exec(fullReport);

      if (secMatch) {
        const sectionIdx = secMatch.index;
        // 从该小节标题后截取
        const reportAfterSection = fullReport.slice(sectionIdx + secMatch[0].length);

        // 提取 markdown 代码块（```json ... ``` 或 ``` ... ```)
        // 匹配第一个代码块
        const codeBlockRegex = /```(?:json)?\s*\n?([\s\S]*?)\n?```/m;
        const codeBlockMatch = codeBlockRegex.exec(reportAfterSection);

        let jsonObj: CertificateData | null = null;
        if (codeBlockMatch) {
          const jsonRawStr = codeBlockMatch[1].trim();
          try {
            jsonObj = JSON.parse(jsonRawStr) as CertificateData;
            console.log("✅ 成功解析诊断证书 JSON:", jsonObj);
          } catch (e) {
            console.error("❌ 诊断证书 JSON 解析失败:", e);
            console.error("原始 JSON 字符串:", jsonRawStr.substring(0, 200));
          }
        } else {
          console.warn("⚠️ 未找到 JSON 代码块");
        }

        // 提取报告主体内容（去掉证书部分）
        const beforeSection = fullReport.slice(0, sectionIdx).trim();
        setReportText(beforeSection);
        setCertificateData(jsonObj);
      } else {
        // 解析不到证书，直接全部当报告内容
        console.warn("⚠️ 未找到 [4. 币圈精神病确诊通知书] 章节");
        setReportText(fullReport.trim());
        setCertificateData(null);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("localStorage 解析 error:", err);
      router.push("/");
      return;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleBack = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <main className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground font-mono">加载中...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">分析报告</h1>
          <Button variant="outline" onClick={handleBack}>
            返回首页
          </Button>
        </div>
        <div className="space-y-10">
          {/* 上半部分：诊断文本 */}
          <div className="rounded-2xl border bg-card/70 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">诊断分析</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  code: ({ node, inline, className, children, ...props }: any) => {
                    if (inline) {
                      return (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-primary" {...props}>
                          {children}
                        </code>
                      );
                    }
                    return (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto border">
                        <code className="text-sm font-mono" {...props}>
                          {children}
                        </code>
                      </pre>
                    );
                  },
                  pre: ({ children }: any) => <>{children}</>,
                }}
              >
                {reportText || "暂无报告文本"}
              </ReactMarkdown>
            </div>
          </div>
          {/* 下半部分：确诊证书 */}
          {certificateData && (
            <DiagnosisCard data={certificateData} />
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
