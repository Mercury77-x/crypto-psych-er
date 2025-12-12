"use client"

import { Activity, Skull, Sparkles, TrendingDown, TrendingUp, Moon, Sun, Zap } from "lucide-react"
import type { DiagnosisData } from "../diagnosis-dashboard"

interface DeepPathologyProps {
  data: DiagnosisData
}

export function DeepPathology({ data }: DeepPathologyProps) {
  return (
    <section className="space-y-8">
      <h2 className="flex items-center gap-4 text-2xl font-mono text-foreground tracking-widest">
        <span className="w-16 h-[3px] bg-secondary" />
        <span className="text-secondary font-black text-3xl">02</span>
        <span className="font-bold">深度病情分析</span>
      </h2>

      <div className="space-y-12">
        {/* 2.1 交易风格画像 */}
        <div className="p-8 bg-card/80 border border-border/50 space-y-8">
          <div className="flex items-center gap-3">
            <Activity className="w-7 h-7 text-secondary" />
            <h3 className="font-mono text-xl text-secondary font-bold">2.1 交易风格画像</h3>
          </div>

          {/* 双重人格展示 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.tradingStyle.personas.map((persona, index) => (
              <div
                key={index}
                className={`p-6 border-2 ${persona.isPositive ? "border-secondary/50 bg-secondary/5" : "border-primary/50 bg-primary/5"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{persona.icon}</span>
                    <span className={`font-bold text-lg ${persona.isPositive ? "text-secondary" : "text-primary"}`}>
                      {persona.name}
                    </span>
                  </div>
                  <span className={`text-2xl font-black ${persona.isPositive ? "text-secondary" : "text-primary"}`}>
                    {persona.pnl}
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm font-mono text-foreground/70">
                    <span>交易次数: {persona.trades} 次</span>
                    <span>占比: {persona.tradesPercent}%</span>
                  </div>
                  <div className="h-2 bg-background/50 overflow-hidden">
                    <div
                      className={`h-full ${persona.isPositive ? "bg-secondary" : "bg-primary"}`}
                      style={{ width: `${persona.tradesPercent}%` }}
                    />
                  </div>
                </div>
                <p className="font-mono text-sm leading-relaxed text-foreground/90">{persona.description}</p>
              </div>
            ))}
          </div>

          {/* 情绪多巴胺曲线 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-5 h-5 text-primary" />
                <span className="font-mono font-bold text-primary">死亡时段</span>
              </div>
              <p className="text-2xl font-black text-primary mb-1">{data.tradingStyle.emotionCurve.deathHours}</p>
              <p className="text-sm font-mono text-foreground/70">
                累计亏损 {data.tradingStyle.emotionCurve.deathLoss}
              </p>
            </div>
            <div className="p-5 bg-secondary/10 border border-secondary/30">
              <div className="flex items-center gap-2 mb-3">
                <Sun className="w-5 h-5 text-secondary" />
                <span className="font-mono font-bold text-secondary">黄金时段</span>
              </div>
              <p className="text-2xl font-black text-secondary mb-1">{data.tradingStyle.emotionCurve.goldenHours}</p>
              <p className="text-sm font-mono text-foreground/70">
                单小时盈利可达 {data.tradingStyle.emotionCurve.goldenProfit}
              </p>
            </div>
          </div>

          {/* 币种毒性检测 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="font-mono font-bold text-primary flex items-center gap-2">
                <TrendingDown className="w-5 h-5" /> 剧毒资产
              </p>
              <div className="space-y-2">
                {data.tradingStyle.coinDetection.toxic.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-primary/10 border border-primary/20"
                  >
                    <span className="font-mono text-foreground">{item.coin}</span>
                    <span className="font-mono font-bold text-primary">{item.pnl}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <p className="font-mono font-bold text-secondary flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> 守护神
              </p>
              <div className="space-y-2">
                {data.tradingStyle.coinDetection.guardian.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-secondary/10 border border-secondary/20"
                  >
                    <span className="font-mono text-foreground">{item.coin}</span>
                    <span className="font-mono font-bold text-secondary">{item.pnl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 文字分析 */}
          <div className="p-6 bg-background/50 border-l-4 border-secondary">
            <p className="font-mono text-base leading-loose text-foreground">{data.tradingStyle.analysis}</p>
          </div>
        </div>

        <div className="p-8 bg-card/80 border-2 border-primary space-y-10">
          <div className="flex items-center gap-3">
            <Skull className="w-8 h-8 text-primary" />
            <h3 className="font-mono text-2xl text-primary font-black">2.2 死亡禁区：是谁亲手杀死了那个富翁？</h3>
          </div>

          {/* 开场白 */}
          <div className="p-6 bg-primary/10 border-l-4 border-primary">
            <p className="font-mono text-lg leading-relaxed text-foreground font-bold">
              我要告诉你一个让你背脊发凉的真相：你账户里的钱，不是被庄家骗走的，是你像个精神分裂的疯子一样，亲手扔进碎纸机的。
            </p>
          </div>

          {/* 分裂人格对比卡片 - 天堂 vs 地狱 */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-0">
              {/* 天堂组 */}
              <div className="p-8 bg-secondary/10 border-2 border-secondary relative">
                <div className="absolute -top-4 left-6 px-4 py-1 bg-secondary text-secondary-foreground font-mono font-black text-sm">
                  THE GRAIL · 天堂组
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-lg font-mono text-foreground/70">
                      {data.deathZone.contrastCard.heaven.sublabel}
                    </p>
                    <p className="text-2xl font-black text-foreground">{data.deathZone.contrastCard.heaven.label}</p>
                  </div>
                  <p className="text-5xl font-black text-secondary">{data.deathZone.contrastCard.heaven.pnl}</p>
                  <div className="inline-block px-4 py-2 bg-secondary/20 border border-secondary">
                    <p className="font-mono font-bold text-secondary">「{data.deathZone.contrastCard.heaven.tag}」</p>
                  </div>
                </div>
              </div>

              {/* 中间撕裂线 */}
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary via-foreground/20 to-primary transform -translate-x-1/2 z-10">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-background border-2 border-foreground/30 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-foreground/50" />
                </div>
              </div>

              {/* 地狱组 */}
              <div className="p-8 bg-primary/10 border-2 border-primary relative">
                <div className="absolute -top-4 right-6 px-4 py-1 bg-primary text-primary-foreground font-mono font-black text-sm">
                  THE ABYSS · 地狱组
                </div>
                <div className="mt-4 space-y-4 text-right">
                  <div>
                    <p className="text-lg font-mono text-foreground/70">{data.deathZone.contrastCard.hell.sublabel}</p>
                    <p className="text-2xl font-black text-foreground">{data.deathZone.contrastCard.hell.label}</p>
                  </div>
                  <p className="text-5xl font-black text-primary">{data.deathZone.contrastCard.hell.pnl}</p>
                  <div className="inline-block px-4 py-2 bg-primary/20 border border-primary">
                    <p className="font-mono font-bold text-primary">「{data.deathZone.contrastCard.hell.tag}」</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center font-mono text-sm text-foreground/50 mt-4">
              维度：{data.deathZone.contrastCard.dimension}
            </p>
          </div>

          {/* 三刀解剖 */}
          <div className="space-y-8">
            {data.deathZone.autopsy.map((item, index) => (
              <div key={index} className="space-y-4">
                <h4 className="text-xl font-black text-primary flex items-center gap-3">
                  <span className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center font-mono">
                    {index + 1}
                  </span>
                  {item.title}
                </h4>
                <div className="p-6 bg-background/50 border-l-4 border-primary/50">
                  <p className="font-mono text-base leading-loose text-foreground whitespace-pre-line">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 手续费痛点 - 紧凑设计 */}
          <div className="p-6 bg-primary/20 border-2 border-primary">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-1">
                <p className="font-mono text-sm text-foreground/70 mb-2">累计智商税（手续费）</p>
                <p className="text-4xl font-black text-primary">{data.deathZone.feesPain.totalFees}</p>
              </div>
              <div className="flex-1 space-y-1 text-sm font-mono text-foreground/80">
                <p>
                  共 <span className="text-primary font-bold">{data.deathZone.feesPain.totalTrades}</span> 笔交易
                </p>
                <p>
                  创造 <span className="text-primary font-bold">{data.deathZone.feesPain.totalVolume}</span> 交易量
                </p>
                <p>
                  工作 <span className="text-primary font-bold">{data.deathZone.feesPain.workHours}</span> 小时
                </p>
                <p>
                  时薪 <span className="text-primary font-bold">{data.deathZone.feesPain.hourlyRate}</span>
                </p>
              </div>
              <div className="flex-1">
                <p className="text-xs text-foreground/50 mb-2">{data.deathZone.feesPain.marketOrderNote}</p>
                <p className="font-mono text-base leading-relaxed text-foreground font-bold">
                  {data.deathZone.feesPain.painText}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2.3 废墟中的黄金 */}
        <div className="p-8 bg-card/80 border-2 border-secondary/50 space-y-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-secondary/5 pointer-events-none" />

          <div className="relative flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-secondary" />
            <h3 className="font-mono text-xl text-secondary font-bold">2.3 废墟中的黄金</h3>
          </div>

          <p className="relative font-mono text-lg text-secondary font-bold">{data.goldenRuins.intro}</p>

          <div className="relative space-y-4">
            {data.goldenRuins.strengths.map((strength, index) => (
              <div key={index} className="p-5 bg-background/50 border-l-4 border-secondary">
                <p className="text-secondary font-bold text-base mb-2">【{strength.title}】</p>
                <p className="font-mono text-base leading-relaxed text-foreground">{strength.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
