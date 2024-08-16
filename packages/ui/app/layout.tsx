import Sidebar from '@/components/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { Metadata } from 'next'
import { ThemeProvider } from 'next-themes'
import { Inter } from 'next/font/google'
import './globals.css'

export const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://aiui.tariel.me'),
  title: 'AI UI',
  description: 'A UI for AI'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.className} antialiased  `}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
          <Toaster position='bottom-right' richColors />
          <Sidebar>{children}</Sidebar>
        </ThemeProvider>
      </body>
    </html>
  )
}
