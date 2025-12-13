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
  return (
    <div className="min-h-screen bg-background">
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#fff 1px, transparent 1px),
            linear-gradient(90deg, #fff 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-16">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold">编号：</span>
            <span className="text-lg">{data.patient_id}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold">病症：</span>
            <span className="text-lg">{data.diagnosis}</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-bold">标签：</span>
            <div className="flex flex-wrap space-x-2">
              {data.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 bg-gray-100 rounded text-sm text-gray-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-lg font-bold">医生建议：</span>
            <div className="mt-2 text-base whitespace-pre-line">{data.doctor_advice}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
