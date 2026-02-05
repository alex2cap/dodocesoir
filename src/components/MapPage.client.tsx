"use client"

import { useState, useMemo, useRef } from "react"
import type L from "leaflet"
import dynamic from "next/dynamic"

const Map = dynamic(() => import("./Map.client"), { ssr: false })
import SearchPanel from "./SearchPanel.client"
import GeolocateButton from "./GeolocateButton.client"
import LanguageSwitcher from "./LanguageSwitcher.client"
import type { Accommodation } from "@/types"

interface Props {
  accommodations: Accommodation[]
}

export default function MapPage({ accommodations }: Props) {
  const [search, setSearch] = useState("")
  const [stageFilter, setStageFilter] = useState<number | null>(null)
  const [availableOnly, setAvailableOnly] = useState(false)
  const mapInstance = useRef<L.Map | null>(null)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return accommodations.filter((a) => {
      if (q && !a.name.toLowerCase().includes(q) && !a.town.toLowerCase().includes(q)) return false
      if (stageFilter && a.stg !== stageFilter) return false
      if (availableOnly && a.availability_status !== "available") return false
      return true
    })
  }, [accommodations, search, stageFilter, availableOnly])

  // Stages présentes dans les données
  const stages = useMemo(() => {
    const set = new Set(accommodations.map((a) => a.stg))
    return Array.from(set).sort((a, b) => a - b)
  }, [accommodations])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Carte — couche de base */}
      <Map
        accommodations={filtered}
        onMapReady={(m) => { mapInstance.current = m }}
      />

      {/* Barre de recherche + filtres — z-index au-dessus de la carte */}
      <div className="absolute top-0 left-0 right-0 z-[1000]">
        <SearchPanel
          search={search}
          setSearch={setSearch}
          stageFilter={stageFilter}
          setStageFilter={setStageFilter}
          availableOnly={availableOnly}
          setAvailableOnly={setAvailableOnly}
          stages={stages}
          filteredCount={filtered.length}
          totalCount={accommodations.length}
        />
      </div>

      {/* Bouton géolocalisation — coin inférieur droit */}
      <div className="absolute bottom-6 right-4 z-[1000]">
        <GeolocateButton map={mapInstance.current} />
      </div>

      {/* Sélecteur de langue + lien hébergeur — coin inférieur gauche */}
      <div className="absolute bottom-6 left-4 z-[1000] flex flex-col items-start gap-2">
        <LanguageSwitcher />
        <a
          href="/provider/login"
          className="bg-white/90 backdrop-blur text-xs text-gray-500 px-3 py-1.5 rounded-full shadow border border-gray-200 hover:text-gray-700 transition"
        >
          Hébergeur ?
        </a>
      </div>
    </div>
  )
}
