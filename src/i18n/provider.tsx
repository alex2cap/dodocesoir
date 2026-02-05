"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { Locale } from "@/types"

import fr from "./locales/fr.json"
import en from "./locales/en.json"
import es from "./locales/es.json"
import de from "./locales/de.json"
import it from "./locales/it.json"

const DICTIONARIES: Record<Locale, Record<string, string>> = { fr, en, es, de, it }
const LOCALES: Locale[] = ["fr", "en", "es", "de", "it"]
const STORAGE_KEY = "dodocesoir_locale"
const DEFAULT: Locale = "fr"

interface I18nContext {
  locale: Locale
  locales: Locale[]
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string>) => string
}

const Ctx = createContext<I18nContext | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  // Start with default to avoid hydration mismatch
  const [locale, setLocaleState] = useState<Locale>(DEFAULT)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved in DICTIONARIES) {
      setLocaleState(saved as Locale)
      return
    }
    const browser = navigator.language?.split("-")[0]
    if (browser && browser in DICTIONARIES) setLocaleState(browser as Locale)
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    localStorage.setItem(STORAGE_KEY, l)
  }, [])

  // Fonction de traduction avec interpolation {{variable}}
  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let value = DICTIONARIES[locale]?.[key] ?? DICTIONARIES[DEFAULT]?.[key] ?? key
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{{${k}}}`, v)
        }
      }
      return value
    },
    [locale]
  )

  return (
    <Ctx.Provider value={{ locale, locales: LOCALES, setLocale, t }}>
      {children}
    </Ctx.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useI18n() must be called inside <I18nProvider>")
  return ctx
}
