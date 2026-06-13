import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sun Seeker',
  description: 'A comunidade dos caçadores de pôr do sol',
  manifest: '/manifest.json',
  themeColor: '#0a0a0f',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0a0a0f] text-white min-h-screen">
        {children}
      </body>
    </html>
  )
}
