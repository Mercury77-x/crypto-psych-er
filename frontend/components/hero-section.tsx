"use client"

import type React from "react"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Upload, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { FloatingElements } from "./floating-elements"

export function HeroSection() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("请上传 CSV 文件")
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      // 确保 API URL 正确
      let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      // 移除末尾的斜杠
      apiUrl = apiUrl.replace(/\/$/, "")
      const fullUrl = `${apiUrl}/analyze`
      console.log("上传到 API:", fullUrl)
      console.log("环境变量 NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL)

      let resp: Response
      try {
        resp = await fetch(fullUrl, {
          method: "POST",
          body: formData,
        })
        console.log("响应状态:", resp.status, resp.statusText)
      } catch (fetchError) {
        console.error("Fetch 错误:", fetchError)
        // 处理网络错误（CORS、连接失败等）
        if (fetchError instanceof TypeError && fetchError.message.includes("Failed to fetch")) {
          throw new Error(
            `无法连接到后端服务器。请检查：\n1. 后端服务是否正常运行\n2. API URL 是否正确配置（当前: ${apiUrl})\n3. 是否存在 CORS 问题`
          )
        }
        throw fetchError
      }

      // 先读取响应文本（只能读取一次）
      const responseText = await resp.text()
      
      if (!resp.ok) {
        let errorMessage = "上传失败，请稍后再试"
        try {
          // 尝试解析为 JSON
          const data = JSON.parse(responseText)
          errorMessage = data?.detail || data?.error || errorMessage
          console.error("API 错误响应:", data)
        } catch {
          // 如果不是 JSON，直接使用文本
          console.error("API 错误文本:", responseText)
          errorMessage = responseText || errorMessage
        }
        throw new Error(errorMessage)
      }

      // 解析成功响应的 JSON
      const result = JSON.parse(responseText)
      console.log("上传成功，结果:", result)
      
      if (typeof window !== "undefined") {
        localStorage.setItem("analysisData", JSON.stringify(result))
      }

      startTransition(() => {
        router.push("/report")
      })
    } catch (e) {
      console.error("上传错误:", e)
      let errorMessage = "上传失败，请稍后再试"
      if (e instanceof Error) {
        errorMessage = e.message
      } else if (typeof e === "string") {
        errorMessage = e
      }
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Floating artistic elements */}
      <FloatingElements />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(#fff 1px, transparent 1px),
            linear-gradient(90deg, #fff 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-40 flex items-center justify-center border-2 border-dashed border-primary">
          <p className="text-2xl font-mono text-primary">释放文件以上传 CSV</p>
        </div>
      )}

      {/* Main content - perfectly centered */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-5xl w-full">
        {/* Main headline with chromatic aberration effect */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight text-foreground glitch-chromatic leading-none">
          币圈精神科
          <br />
          <span className="text-primary">急诊室</span>
        </h1>

        <div className="mt-8 md:mt-12 relative">
          <p className="text-lg sm:text-xl md:text-2xl font-mono text-muted-foreground tracking-widest">
            <span className="text-secondary">{"// "}</span>
            专治各种不服
            <span className="mx-2 text-primary">·</span>
            死人也能医活
          </p>
          {/* Decorative underline */}
          <div className="mt-3 h-[1px] w-full bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
        </div>

        {/* Upload section - centered */}
        <div className="mt-16 md:mt-20 flex flex-col items-center w-full max-w-lg">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
            aria-label="上传币安CSV文件"
          />

          <button
            onClick={handleButtonClick}
            disabled={isLoading || isPending}
            className="group relative flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-bold text-lg tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,0,60,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading || isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                急诊挂号（上传币安CSV文件）
              </>
            )}
            {/* Animated border */}
            <span className="absolute inset-0 border border-primary opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
          </button>

          {error && (
            <p className="mt-4 text-sm font-mono text-destructive animate-in fade-in slide-in-from-top-2">
              {error}
            </p>
          )}

          {/* Instructions toggle */}
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="mt-6 flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-secondary transition-colors"
          >
            {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            如何获取币安CSV文件？
          </button>

          {showInstructions && (
            <div className="mt-4 p-6 bg-card/80 backdrop-blur-sm border border-border text-left font-mono space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <p className="text-secondary font-semibold text-sm">获取步骤：</p>
              <ol className="list-decimal list-inside space-y-2 text-xs text-muted-foreground leading-relaxed">
                <li>进入币安网页端</li>
                <li>
                  点击头像下的「<span className="text-foreground">订单</span>」模块
                </li>
                <li>
                  找到「<span className="text-foreground">合约订单</span>」模块
                </li>
                <li>
                  找到「<span className="text-foreground">历史仓位</span>」模块
                </li>
                <li>点击下载你的仓位历史交割单</li>
              </ol>
              <p className="text-primary text-xs pt-2 border-t border-border">推荐选择 3/6 个月的数据</p>
            </div>
          )}
        </div>

        {/* Bottom hint */}
        <p className="mt-12 text-xs font-mono text-muted-foreground/60 tracking-wider">拖放或点击上传您的交易记录</p>
      </div>

      {/* Minimal corner decorations */}
      <div className="absolute top-6 left-6 w-12 h-12 border-l border-t border-border/30" />
      <div className="absolute top-6 right-6 w-12 h-12 border-r border-t border-border/30" />
      <div className="absolute bottom-6 left-6 w-12 h-12 border-l border-b border-border/30" />
      <div className="absolute bottom-6 right-6 w-12 h-12 border-r border-b border-border/30" />
    </section>
  )
}
