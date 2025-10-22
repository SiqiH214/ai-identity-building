import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Identity Mix Match',
  description: 'Create imagined moments with your real identity - AI-powered identity image generation',
  openGraph: {
    title: 'Identity Mix Match',
    description: 'Create imagined moments with your real identity - AI-powered identity image generation',
    url: 'https://identity-building-moj2.vercel.app',
    siteName: 'Identity Mix Match',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Identity Mix Match',
    description: 'Create imagined moments with your real identity - AI-powered identity image generation',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

