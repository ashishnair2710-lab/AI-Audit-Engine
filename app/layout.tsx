import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Client Portal — Al Huzaifa Furniture',
  description: 'CRM & Lead Management Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans bg-brand-gray text-brand-black antialiased`}>
        {children}
      </body>
    </html>
  )
}
