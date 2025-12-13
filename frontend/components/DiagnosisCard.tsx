"use client"

import React from "react"

export interface DiagnosisCardProps {
  data: {
    patient_id: string
    diagnosis: string
    tags: string[]
    doctor_advice: string
  }
}

export function DiagnosisCard({ data }: DiagnosisCardProps) {
  // 确保所有字段都有默认值
  const patientId = data.patient_id || "未知";
  const diagnosis = data.diagnosis || "暂无诊断";
  const tags = data.tags || [];
  const doctorAdvice = data.doctor_advice || "暂无建议";

  return (
    <div className="relative rounded-2xl border bg-card/70 p-8 shadow-sm overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#fff 1px, transparent 1px),
            linear-gradient(90deg, #fff 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      <div className="relative z-10 space-y-6">
        <h2 className="text-2xl font-bold mb-6">币圈精神病确诊通知书</h2>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-base font-semibold text-muted-foreground">编号：</span>
            <span className="text-lg font-mono text-foreground">{patientId}</span>
          </div>
          
          <div className="flex items-start space-x-4">
            <span className="text-base font-semibold text-muted-foreground">病症：</span>
            <span className="text-lg text-foreground flex-1">{diagnosis}</span>
          </div>
          
          <div className="flex items-start space-x-4">
            <span className="text-base font-semibold text-muted-foreground">标签：</span>
            <div className="flex flex-wrap gap-2 flex-1">
              {tags.length > 0 ? (
                tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-block px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">暂无标签</span>
              )}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <span className="text-base font-semibold text-muted-foreground block mb-2">医生建议：</span>
            <div className="text-base text-foreground whitespace-pre-line leading-relaxed">
              {doctorAdvice}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
