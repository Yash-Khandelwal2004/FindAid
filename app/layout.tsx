import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/components/layout/Navbar"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets:  ["latin"],
})

export const metadata: Metadata = {
  title:       "FindAid — Emergency Aid Sharing",
  description: "Find and share emergency aid items like blood, oxygen and more",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geist.variable} font-sans antialiased min-h-screen bg-background text-foreground flex flex-col`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-border py-6 text-center text-muted-foreground text-sm">
          FindAid © {new Date().getFullYear()} — Sharing aid, saving lives
        </footer>
        <Toaster />
      </body>
    </html>
  )
}