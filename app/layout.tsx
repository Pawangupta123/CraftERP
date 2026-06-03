import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'CraftERP — Handicraft Export Management',
  description: 'End-to-end ERP for handicraft manufacturing and export',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-gray-50">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
