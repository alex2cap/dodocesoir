"use client"

import { useState } from "react"
import { useI18n } from "@/i18n/provider"
import type { Locale } from "@/types"

export default function LanguageSwitcher() {
  const { locale, locales, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-white/90 backdrop-blur text-sm font-semibold text-gray-700 px-3 py-1.5 rounded-full shadow border border-gray-200 hover:bg-white transition"
      >
        {locale.toUpperCase()}
      </button>

      {open && (
        <div className="absolute bottom-full mb-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false) }}
              className={`block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-50 transition ${l === locale ? "font-bold text-green-700" : "text-gray-700"}`}
            >
              {t(`lang.${l}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
