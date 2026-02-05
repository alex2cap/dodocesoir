"use client"

import { useEffect, useRef, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useI18n } from "@/i18n/provider"
import { createPopupHtml } from "./AccommodationPopup"
import type { Accommodation, AvailabilityStatus } from "@/types"

// ── Icônes de marqueur selon statut ──────────────────────────
const STATUS_COLORS: Record<AvailabilityStatus, string> = {
  available: "#22c55e",
  full: "#ef4444",
  expired: "#d1d5db",
  unknown: "#d1d5db",
}

function markerIcon(status: AvailabilityStatus, precision: string | null): L.DivIcon {
  const bg = STATUS_COLORS[status]
  const border = precision === "exact" ? "#374151" : "#9ca3af"
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50%;background:${bg};border:3px solid ${border};box-shadow:0 2px 5px rgba(0,0,0,.3)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  })
}

// ── Composant carte ──────────────────────────────────────────
interface Props {
  accommodations: Accommodation[]
  onMapReady?: (map: L.Map) => void
}

export default function Map({ accommodations, onMapReady }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markersRef = useRef<L.Marker[]>([])
  const { t } = useI18n()

  // Initialisation unique de la carte
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [44.65, 3.2],   // centre Le Puy → Conques
      zoom: 9,
      zoomControl: true,
    })

    // Tuiles OpenStreetMap (gratuit, pas de clé API)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map)

    mapRef.current = map
    onMapReady?.(map)

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mise à jour des marqueurs quand la liste filtrée change
  useEffect(() => {
    if (!mapRef.current) return

    // Supprimer marqueurs précédents
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    accommodations.forEach((acc) => {
      if (acc.lat == null || acc.lng == null) return

      const marker = L.marker([acc.lat, acc.lng], {
        icon: markerIcon(acc.availability_status, acc.gps_precision),
        alt: acc.name,
      })

      marker.bindPopup(createPopupHtml(acc, t), { maxWidth: 240 })
      marker.addTo(mapRef.current!)
      markersRef.current.push(marker)
    })
  }, [accommodations, t])

  return <div ref={containerRef} className="h-full w-full" />
}
