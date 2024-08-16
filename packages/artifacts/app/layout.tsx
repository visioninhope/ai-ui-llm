import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Artifact Renderer',
  description: 'An app to render artifacts for AI UI'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <script async src='https://cdn.tailwindcss.com'></script>
      <body className={`${inter.className} h-full w-full`}>{children}</body>
    </html>
  )
}
