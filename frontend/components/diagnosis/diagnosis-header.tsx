"use client"

import { AlertTriangle } from "lucide-react"

interface DiagnosisHeaderProps {
  patientName: string
  setPatientName: (name: string) => void
}

export function DiagnosisHeader({ patientName, setPatientName }: DiagnosisHeaderProps) {
  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-card/50 border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-foreground/60 font-mono text-base">患者代号:</span>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value.slice(0, 60))}
            className="bg-transparent border-b-2 border-primary text-foreground font-mono text-xl focus:outline-none focus:border-secondary transition-colors max-w-[200px]"
            placeholder="输入代号..."
            maxLength={60}
          />
        </div>
        <span className="hidden md:inline text-foreground/30">|</span>
        <div className="text-foreground/60 font-mono text-base">
          日期: <span className="text-foreground">{today}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 px-6 py-3 bg-primary/20 border border-primary">
        <AlertTriangle className="w-5 h-5 text-primary animate-pulse" />
        <span className="font-mono text-primary font-bold tracking-wider">病危通知</span>
      </div>
    </header>
  )
}
