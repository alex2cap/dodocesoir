"use client"

import { useState } from "react"
import type L from "leaflet"
import { useI18n } from "@/i18n/provider"

export default function GeolocateButton({ map }: { map: L.Map | null }) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  function locate() {
    if (!map || loading) return
    setLoading(true)
    setError(false)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 13)
        setLoading(false)
      },
      () => {
        setError(true)
        setLoading(false)
      },
      { timeout: 5000 }
    )
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={locate}
        title={t("search.geolocate")}
        className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center text-xl hover:bg-gray-50 active:scale-95 transition"
      >
        {loading ? "⏳" : "📍"}
      </button>
      {error && (
        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-lg shadow">
          {t("search.geolocate_error")}
        </span>
      )}
    </div>
  )
}
