"use client"

import { Calendar, Pill, Target, Clock, Ban, CheckCircle2, MessageSquare } from "lucide-react"
import type { DiagnosisData } from "../diagnosis-dashboard"

interface RescuePrescriptionProps {
  data: DiagnosisData
}

export function RescuePrescription({ data }: RescuePrescriptionProps) {
  return (
    <section className="space-y-8">
      <h2 className="flex items-center gap-4 text-2xl font-mono text-foreground tracking-widest">
        <span className="w-16 h-[3px] bg-secondary" />
        <span className="text-secondary font-black text-3xl">03</span>
        <span className="font-bold">专属拯救处方</span>
      </h2>

      <div className="p-8 bg-card/80 border border-border/50 relative">
        {/* Rx Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 pb-6 border-b border-dashed border-border/50">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 border-2 border-secondary flex items-center justify-center">
              <span className="text-4xl font-serif text-secondary italic">Rx</span>
            </div>
            <div>
              <h3 className="font-mono text-xl text-secondary font-bold">币圈精神科急诊室</h3>
              <p className="text-sm text-foreground/60 font-mono">Crypto Psychiatric ER - ICU</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-foreground/60 font-mono">处方编号</p>
            <p className="font-mono text-secondary text-lg">
              #RX-2024-
              {Math.floor(Math.random() * 10000)
                .toString()
                .padStart(4, "0")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左列: 处方药物 + 禁忌事项 */}
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-secondary">
                <Pill className="w-6 h-6" />
                <span className="text-lg font-mono font-bold">处方药物</span>
              </div>
              <ul className="space-y-5">
                {data.prescription.medicines.map((medicine, index) => (
                  <li key={index} className="flex items-start gap-3 p-4 bg-background/50 border-l-4 border-secondary">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-foreground font-mono font-bold text-base">{medicine.name}</span>
                      <p className="text-foreground/90 text-base mt-2 font-mono leading-relaxed">{medicine.usage}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Ban className="w-6 h-6" />
                <span className="text-lg font-mono font-bold">禁忌事项</span>
              </div>
              <ul className="space-y-3 p-4 bg-primary/5 border border-primary/20">
                {data.prescription.forbidden.map((item, index) => (
                  <li key={index} className="flex items-center gap-3 font-mono text-base text-foreground">
                    <span className="text-primary font-bold text-lg">×</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 右列: 康复计划时间线 */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-secondary">
              <Calendar className="w-6 h-6" />
              <span className="text-lg font-mono font-bold">康复计划时间线</span>
            </div>

            <div className="relative pl-10 space-y-8">
              <div className="absolute left-[14px] top-3 bottom-3 w-[2px] bg-border/50" />

              {data.prescription.timeline.map((item, index) => (
                <div key={index} className="relative">
                  <div
                    className={`absolute left-[-32px] w-5 h-5 rounded-full border-2 border-background ${
                      item.isGoal ? "bg-secondary" : index === 0 ? "bg-primary" : "bg-primary/60"
                    }`}
                  />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {item.isGoal ? (
                        <Target className="w-5 h-5 text-secondary" />
                      ) : (
                        <Clock className="w-5 h-5 text-foreground/50" />
                      )}
                      <span
                        className={`text-base font-mono ${item.isGoal ? "text-secondary font-bold" : "text-foreground/70"}`}
                      >
                        {item.period}
                      </span>
                    </div>
                    <p
                      className={`font-mono text-base leading-relaxed ${item.isGoal ? "text-secondary font-bold" : "text-foreground"}`}
                    >
                      {item.task}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-secondary/10 border border-secondary/30">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-secondary" />
            <span className="font-mono font-bold text-secondary">医生结语</span>
          </div>
          <p className="font-mono text-base leading-loose text-foreground">{data.prescription.doctorConclusion}</p>
        </div>

        {/* Doctor signature */}
        <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-foreground/60 font-mono">主治医师</p>
            <p className="font-mono text-secondary text-lg">Dr. AI & Mercury77</p>
          </div>
        </div>
      </div>
    </section>
  )
}
