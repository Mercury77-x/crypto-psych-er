"use client"

import { useState } from "react"
import { Share2, Download, Twitter } from "lucide-react"
import type { DiagnosisData } from "../diagnosis-dashboard"

type ReportMode = "hardcore" | "meme"

interface MedicalCardProps {
  patientName: string
  data: DiagnosisData
}

export function MedicalCard({ patientName, data }: MedicalCardProps) {
  const [mode, setMode] = useState<ReportMode>("hardcore")

  const modeLabels = {
    hardcore: "硬核模式",
    meme: "精神状态",
  }

  const handleShare = async () => {
    const tagText = data.tags.map((t) => `「${t}」`).join(" ")
    const text = encodeURIComponent(`我在币圈精神科急诊室的诊断结果：${tagText}\n\n来测测你的精神状态 👇`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank")
  }

  return (
    <section className="space-y-6">
      <h2 className="flex items-center gap-4 text-2xl font-mono text-foreground tracking-widest">
        <span className="w-16 h-[3px] bg-primary" />
        <span className="text-primary font-black text-3xl">04</span>
        <span className="font-bold">病历卡</span>
        <span className="ml-2 px-3 py-1 bg-primary/20 text-primary text-xs font-bold">可分享</span>
      </h2>

      {/* Mode Switch - 更紧凑 */}
      <div className="flex gap-2">
        {(["hardcore", "meme"] as ReportMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 text-sm font-mono font-bold transition-all border ${
              mode === m
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-transparent text-foreground/60 border-border/50 hover:text-foreground hover:border-border"
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto">
        <div className="relative bg-card border border-primary/50 overflow-hidden">
          {/* 顶部红条 */}
          <div className="h-1 bg-primary" />

          {/* 扫描线效果 */}
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
            }}
          />

          <div className="relative p-6 space-y-5">
            {/* 头部 - 更紧凑 */}
            <div className="flex items-center justify-between pb-4 border-b border-dashed border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
                  +
                </div>
                <div>
                  <h3 className="text-base font-black text-primary tracking-tight">币圈精神科急诊室</h3>
                  <p className="text-[10px] font-mono text-foreground/40 tracking-widest">CRYPTO PSYCHIATRIC ER</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-foreground/40 font-mono">NO.</p>
                <p className="font-mono text-foreground/70 text-xs">
                  #
                  {Math.floor(Math.random() * 100000)
                    .toString()
                    .padStart(6, "0")}
                </p>
              </div>
            </div>

            {/* 患者信息 - 一行 */}
            <div className="flex items-center gap-4 text-xs font-mono text-foreground/60">
              <span>
                患者: <span className="text-foreground font-bold">{patientName}</span>
              </span>
              <span className="text-foreground/30">|</span>
              <span>{new Date().toLocaleDateString("zh-CN")}</span>
            </div>

            {/* 诊断标签 - 最醒目 */}
            <div className="py-4 border-y border-primary/20">
              <div className="flex flex-wrap justify-center gap-2">
                {data.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1.5 bg-primary text-primary-foreground font-black text-lg">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 主治医师诊断意见 - 核心内容 */}
            <div className="space-y-2">
              <p className="text-[10px] text-primary font-mono font-bold tracking-widest">主治医师诊断意见</p>
              <div className="p-4 bg-primary/5 border-l-2 border-primary">
                <p className="font-mono text-sm leading-relaxed text-foreground">{data.cardData.doctorOpinion}</p>
              </div>
            </div>

            {/* 数据统计 - 仅硬核模式显示 */}
            {mode === "hardcore" && (
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="p-2 bg-background/50 border border-border/30 text-center">
                  <p className="text-[10px] text-foreground/50 font-mono">账面盈亏</p>
                  <p className="text-sm font-black text-foreground">{data.cardData.stats.loss}</p>
                </div>
                <div className="p-2 bg-background/50 border border-border/30 text-center">
                  <p className="text-[10px] text-foreground/50 font-mono">估算手续费</p>
                  <p className="text-sm font-black text-primary">{data.cardData.stats.fees}</p>
                </div>
                <div className="p-2 bg-background/50 border border-border/30 text-center">
                  <p className="text-[10px] text-foreground/50 font-mono">真实盈亏</p>
                  <p className="text-sm font-black text-primary">{data.cardData.stats.realPnl}</p>
                </div>
              </div>
            )}

            {/* 底部签名 */}
            <div className="pt-4 border-t border-primary/20 flex justify-between items-end">
              <div className="space-y-0.5">
                <p className="text-[10px] text-foreground/40 font-mono">主治医师签章</p>
                <p className="font-serif italic text-lg text-secondary">Dr. AI & Mercury77</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Twitter className="w-3 h-3 text-foreground/40" />
                  <span className="font-mono text-[10px] text-foreground/50">Mercury77（@moqiuli77）</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-foreground/30">© 2025</div>
            </div>
          </div>

          {/* 底部红条 */}
          <div className="h-1 bg-primary" />
        </div>
      </div>

      {/* Action Buttons - 更紧凑 */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1DA1F2] text-white font-mono text-sm font-bold hover:bg-[#1a8cd8] transition-colors"
        >
          <Share2 className="w-4 h-4" />
          分享到 Twitter
        </button>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground font-mono text-sm font-bold hover:bg-muted transition-colors">
          <Download className="w-4 h-4" />
          下载图片
        </button>
      </div>
    </section>
  )
}
