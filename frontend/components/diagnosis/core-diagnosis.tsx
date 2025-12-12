"use client"

import { AlertCircle, Zap } from "lucide-react"
import type { DiagnosisData } from "../diagnosis-dashboard"

interface CoreDiagnosisProps {
  data: DiagnosisData
}

export function CoreDiagnosis({ data }: CoreDiagnosisProps) {
  return (
    <section className="space-y-8">
      <h2 className="flex items-center gap-4 text-2xl font-mono text-foreground tracking-widest">
        <span className="w-16 h-[3px] bg-primary" />
        <span className="text-primary font-black text-3xl">01</span>
        <span className="font-bold">核心诊断</span>
      </h2>

      <div className="relative p-10 bg-card/80 border border-primary/50 overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-primary/30" />
        <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-primary/30" />

        <div className="flex items-center gap-2 mb-10">
          <AlertCircle className="w-5 h-5 text-primary" />
          <span className="text-sm font-mono text-primary tracking-widest">医疗警报 / MEDICAL ALERT</span>
        </div>

        <div className="mb-12 text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-4">
            {data.tags.map((tag, index) => (
              <span key={index} className="inline-block text-3xl md:text-5xl font-black text-primary">
                【{tag}】
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-center gap-3 text-secondary">
            <Zap className="w-6 h-6" />
            <span className="text-lg font-mono font-bold">AI 诊断摘要</span>
          </div>
          <div className="p-8 bg-background/50 border-l-4 border-secondary space-y-5">
            {data.aiSummary.map((paragraph, index) => (
              <p key={index} className="font-mono text-base leading-loose text-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
