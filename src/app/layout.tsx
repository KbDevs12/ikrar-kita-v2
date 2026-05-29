import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google"
import "@/styles/globals.css"
import { cn } from "@/lib/utils"

const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const fontDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
})

const fontSerif = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Ikrar Kita — Undangan pernikahan digital yang terasa personal",
    template: "%s · Ikrar Kita",
  },
  description:
    "Buat undangan pernikahan digital yang elegan, mudah dibagikan, dan terasa seperti dirancang khusus untuk hari Anda berdua.",
  applicationName: "Ikrar Kita",
  authors: [{ name: "Ikrar Kita" }],
  generator: "Next.js",
  keywords: [
    "undangan pernikahan",
    "undangan digital",
    "wedding invitation",
    "Ikrar Kita",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Ikrar Kita",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1611" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          fontSans.variable,
          fontDisplay.variable,
          fontSerif.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}
