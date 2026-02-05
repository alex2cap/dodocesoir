import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./globals.css"
import { I18nProvider } from "@/i18n/provider"

export const metadata: Metadata = {
  name: "Dodocesoir",
  description: "Hébergements sur le Chemin de Santiago — Le Puy → Conques",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="antialiased">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
