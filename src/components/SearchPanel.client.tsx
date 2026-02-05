"use client"

import { useState } from "react"
import { useI18n } from "@/i18n/provider"

interface Props {
  search: string
  setSearch: (v: string) => void
  stageFilter: number | null
  setStageFilter: (v: number | null) => void
  availableOnly: boolean
  setAvailableOnly: (v: boolean) => void
  stages: number[]
  filteredCount: number
  totalCount: number
}

export default function SearchPanel({
  search, setSearch, stageFilter, setStageFilter,
  availableOnly, setAvailableOnly, stages, filteredCount, totalCount
}: Props) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const hasFilter = stageFilter !== null || availableOnly

  return (
    <div className="bg-white/95 backdrop-blur shadow-md">
      {/* Ligne principale : search + toggle filtres */}
      <div className="flex items-center gap-2 px-3 py-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("search.placeholder")}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={() => setOpen((v) => !v)}
          className={`relative px-3 py-2 rounded-lg text-sm border transition ${
            open || hasFilter ? "bg-green-50 border-green-400 text-green-700" : "bg-gray-100 border-gray-200 text-gray-600"
          }`}
        >
          ☰
          {/* Indicateur si filtres actifs */}
          {hasFilter && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-green-500 rounded-full" />}
        </button>
      </div>

      {/* Panneau filtres (collapsible) */}
      {open && (
        <div className="px-3 pb-3 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-2">
          {/* Filtre étape */}
          <select
            value={stageFilter ?? ""}
            onChange={(e) => setStageFilter(e.target.value ? Number(e.target.value) : null)}
            className="px-2 py-1.5 rounded-lg border border-gray-300 text-sm bg-white"
          >
            <option value="">{t("search.all_stages")}</option>
            {stages.map((s) => (
              <option key={s} value={s}>{t("search.stage")} {s}</option>
            ))}
          </select>

          {/* Filtre disponibilité */}
          <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="accent-green-600"
            />
            {t("search.available_only")}
          </label>

          {/* Compteur résultats */}
          <span className="ml-auto text-xs text-gray-400">
            {filteredCount} / {totalCount}
          </span>
        </div>
      )}

      {/* Légende minimale */}
      <div className="flex items-center gap-4 px-3 py-1.5 bg-gray-50 text-xs text-gray-500 border-t border-gray-100">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-green-500" /> {t("app.legend.available")}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-red-500" /> {t("app.legend.full")}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-full bg-gray-300" /> {t("app.legend.unknown")}</span>
      </div>
    </div>
  )
}
