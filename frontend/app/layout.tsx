import type React from "react"
import type { Metadata, Viewport } from "next"
import { Orbitron, Share_Tech_Mono } from "next/font/google"
import "./globals.css"

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
})

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech-mono",
})

export const metadata: Metadata = {
  title: "币圈精神科急诊室 | Crypto Psychiatric ER",
  description: "专治各种不服，死人也能医活 - Your emergency room for crypto trauma",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${orbitron.variable} ${shareTechMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
