"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

type RawData = {
  vitals?: {
    total_pnl?: number;
    total_fees?: number;
    win_rate?: number;
    hourly_wage?: number;
    trade_count?: number;
  };
  style?: {
    scalping_count?: number;
    scalping_loss?: number;
    swing_count?: number;
    swing_profit?: number;
  };
  assets?: {
    toxic?: string;
    holy?: string;
  };
  mode?: string;
};

type AnalysisResult = {
  report?: string;
  raw_data?: RawData;
  [key: string]: unknown;
};

export default function ReportPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const stored = localStorage.getItem("analysisData");
    console.log("从 localStorage 读取数据:", stored ? "有数据" : "无数据");
    
    if (!stored) {
      // 如果没有数据，重定向到首页
      console.log("没有数据，重定向到首页");
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(stored) as AnalysisResult;
      console.log("解析后的数据:", parsed);
      console.log("report 字段:", parsed.report ? `有 (${parsed.report.length} 字符)` : "无");
      console.log("raw_data 字段:", parsed.raw_data ? "有" : "无");
      setData(parsed);
    } catch (parseError) {
      // 如果解析失败，也重定向
      console.error("解析 localStorage 数据失败:", parseError);
      router.push("/");
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

  if (!data) {
    return null; // 重定向中，不渲染内容
  }

  const rawData = data.raw_data;

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      <section className="mx-auto w-full max-w-4xl px-6 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">分析报告</h1>
          <Button variant="outline" onClick={handleBack}>
            返回首页
          </Button>
        </div>

        <div className="space-y-6">
          {/* 数据概览卡片 */}
          {rawData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 总盈亏 */}
              {rawData.vitals?.total_pnl !== undefined && (
                <div className="rounded-xl border bg-card/70 p-4 shadow-sm">
                  <p className="text-xs font-mono text-muted-foreground mb-1">总盈亏</p>
                  <p className={`text-2xl font-bold ${rawData.vitals.total_pnl >= 0 ? "text-primary" : "text-destructive"}`}>
                    {rawData.vitals.total_pnl >= 0 ? "+" : ""}
                    {rawData.vitals.total_pnl.toFixed(2)} U
                  </p>
                </div>
              )}

              {/* 胜率 */}
              {rawData.vitals?.win_rate !== undefined && (
                <div className="rounded-xl border bg-card/70 p-4 shadow-sm">
                  <p className="text-xs font-mono text-muted-foreground mb-1">胜率</p>
                  <p className="text-2xl font-bold text-foreground">
                    {rawData.vitals.win_rate.toFixed(1)}%
                  </p>
                </div>
              )}

              {/* 交易次数 */}
              {rawData.vitals?.trade_count !== undefined && (
                <div className="rounded-xl border bg-card/70 p-4 shadow-sm">
                  <p className="text-xs font-mono text-muted-foreground mb-1">交易次数</p>
                  <p className="text-2xl font-bold text-foreground">
                    {rawData.vitals.trade_count}
                  </p>
                </div>
              )}

              {/* 时薪 */}
              {rawData.vitals?.hourly_wage !== undefined && (
                <div className="rounded-xl border bg-card/70 p-4 shadow-sm">
                  <p className="text-xs font-mono text-muted-foreground mb-1">时薪</p>
                  <p className={`text-2xl font-bold ${rawData.vitals.hourly_wage >= 0 ? "text-primary" : "text-destructive"}`}>
                    {rawData.vitals.hourly_wage >= 0 ? "+" : ""}
                    {rawData.vitals.hourly_wage.toFixed(2)} U/小时
                  </p>
                </div>
              )}

              {/* 超短线表现 */}
              {rawData.style?.scalping_count !== undefined && (
                <div className="rounded-xl border bg-card/70 p-4 shadow-sm">
                  <p className="text-xs font-mono text-muted-foreground mb-1">超短线</p>
                  <p className="text-sm font-semibold text-foreground">
                    {rawData.style.scalping_count} 次
                  </p>
                  <p className={`text-lg font-bold ${(rawData.style.scalping_loss ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                    {(rawData.style.scalping_loss ?? 0) >= 0 ? "+" : ""}
                    {(rawData.style.scalping_loss ?? 0).toFixed(2)} U
                  </p>
                </div>
              )}

              {/* 波段表现 */}
              {rawData.style?.swing_count !== undefined && (
                <div className="rounded-xl border bg-card/70 p-4 shadow-sm">
                  <p className="text-xs font-mono text-muted-foreground mb-1">波段交易</p>
                  <p className="text-sm font-semibold text-foreground">
                    {rawData.style.swing_count} 次
                  </p>
                  <p className={`text-lg font-bold ${(rawData.style.swing_profit ?? 0) >= 0 ? "text-primary" : "text-destructive"}`}>
                    {(rawData.style.swing_profit ?? 0) >= 0 ? "+" : ""}
                    {(rawData.style.swing_profit ?? 0).toFixed(2)} U
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 资产标签 */}
          {rawData?.assets && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rawData.assets.toxic && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-xs font-mono text-destructive mb-2">毒性资产</p>
                  <p className="text-lg font-bold text-destructive">{rawData.assets.toxic}</p>
                </div>
              )}
              {rawData.assets.holy && (
                <div className="rounded-xl border border-primary/50 bg-primary/10 p-4">
                  <p className="text-xs font-mono text-primary mb-2">圣杯资产</p>
                  <p className="text-lg font-bold text-primary">{rawData.assets.holy}</p>
                </div>
              )}
            </div>
          )}

          {/* 模式标签 */}
          {rawData?.mode && (
            <div className="rounded-xl border bg-card/70 p-4 shadow-sm">
              <p className="text-xs font-mono text-muted-foreground mb-1">交易模式</p>
              <p className="text-lg font-bold text-foreground">{rawData.mode}</p>
            </div>
          )}

          {/* Markdown 报告内容 */}
          <div className="rounded-2xl border bg-card/70 p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">诊断报告</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{data.report ?? "暂无报告文本"}</ReactMarkdown>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

