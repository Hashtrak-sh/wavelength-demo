import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { GoogleAnalytics } from '@next/third-parties/google'
import { AnalyticsDebug } from "@/components/analytics-debug"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Wavelength - AI Chat Platform",
  description: "Connect and chat with AI to discover your wavelength",
  generator: 'v0.dev',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Wavelength',
  },
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      }
    ],
    apple: [
      {
        url: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      }
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <main>{children}</main>
          <Toaster />
        </AuthProvider>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics 
            gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
            dataLayerName="dataLayer"
            debugMode={process.env.NODE_ENV === 'development'}
          />
        )}
        <AnalyticsDebug />
      </body>
    </html>
  )
}
