import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '创作伴侣 - AI 身份生成工具',
  description: '用你的真实身份创造想象中的瞬间',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  )
}

