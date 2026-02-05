"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useI18n } from "@/i18n/provider"
import type { Accommodation } from "@/types"

export default function ProviderDashboard() {
  const { t } = useI18n()
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [capacity, setCapacity] = useState<string>("")
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [notLinked, setNotLinked] = useState(false)

  useEffect(() => {
    init()
  }, [])

  async function init() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = "/provider/login"
      return
    }

    // 1. Chercher le lien provider → accommodation
    let { data: provider } = await supabase
      .from("providers")
      .select("accommodation_id")
      .eq("user_id", session.user.id)
      .single()

    // Si pas de lien, essayer de le créer automatiquement (premier login)
    if (!provider) {
      const { data: acc } = await supabase
        .from("accommodations")
        .select("id")
        .eq("provider_email", session.user.email)
        .single()

      if (acc) {
        await supabase.from("providers").insert({
          user_id: session.user.id,
          accommodation_id: acc.id,
        })
        provider = { accommodation_id: acc.id }
      } else {
        setNotLinked(true)
        setLoading(false)
        return
      }
    }

    // 2. Charger l'hébergement
    const { data: acc } = await supabase
      .from("accommodations")
      .select("*")
      .eq("id", provider.accommodation_id)
      .single()
    setAccommodation(acc)

    // 3. Charger la disponibilité actuelle
    const { data: avail } = await supabase
      .from("availability")
      .select("*")
      .eq("accommodation_id", provider.accommodation_id)
      .single()

    if (avail) {
      setIsAvailable(avail.is_available)
      setCapacity(avail.capacity?.toString() ?? "")
      setLastUpdate(new Date(avail.updated_at).toLocaleString())
    }

    setLoading(false)
  }

  async function handleUpdate() {
    if (isAvailable === null || !accommodation) return
    setSaving(true)
    setSuccess(false)

    await supabase.from("availability").upsert({
      accommodation_id: accommodation.id,
      is_available: isAvailable,
      capacity: capacity ? parseInt(capacity) : null,
      updated_at: new Date().toISOString(),
    })

    setLastUpdate(new Date().toLocaleString())
    setSaving(false)
    setSuccess(true)
    // Cacher le message de succès après 3s
    setTimeout(() => setSuccess(false), 3000)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = "/provider/login"
  }

  // ── États d'attente ──────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-500">⏳</div>
  )
  if (notLinked) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-red-600 font-semibold mb-4">{t("provider.dashboard.not_linked")}</p>
      <button onClick={handleLogout} className="text-sm text-gray-500 underline">{t("provider.dashboard.logout")}</button>
    </div>
  )

  // ── Dashboard principal ──────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <span className="text-lg font-bold text-gray-800">Dodocesoir</span>
        <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-gray-600">
          {t("provider.dashboard.logout")}
        </button>
      </header>

      <div className="max-w-md mx-auto px-4 pt-6">
        {/* Info hébergement */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <h2 className="text-lg font-bold text-gray-800">{accommodation?.name}</h2>
          <p className="text-sm text-gray-500">{accommodation?.town} — Étape {accommodation?.stg}</p>
        </div>

        {/* Sélection statut */}
        <p className="text-sm font-semibold text-gray-600 mb-3">{t("provider.dashboard.title")}</p>
        <div className="flex gap-3">
          <button
            onClick={() => { setIsAvailable(true); setSuccess(false) }}
            className={`flex-1 py-5 rounded-2xl text-base font-bold transition active:scale-95 ${
              isAvailable === true
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ✅ {t("provider.dashboard.available_btn")}
          </button>
          <button
            onClick={() => { setIsAvailable(false); setCapacity(""); setSuccess(false) }}
            className={`flex-1 py-5 rounded-2xl text-base font-bold transition active:scale-95 ${
              isAvailable === false
                ? "bg-red-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            ❌ {t("provider.dashboard.full_btn")}
          </button>
        </div>

        {/* Nombre de places (optionnel, visible si "available") */}
        {isAvailable === true && (
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder={t("provider.dashboard.capacity")}
            className="w-full mt-3 px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        )}

        {/* Bouton mettre à jour */}
        <button
          onClick={handleUpdate}
          disabled={isAvailable === null || saving}
          className="w-full mt-5 py-3.5 bg-blue-600 text-white rounded-xl font-bold text-base disabled:opacity-40 active:scale-95 transition"
        >
          {saving ? "…" : t("provider.dashboard.submit")}
        </button>

        {/* Feedback */}
        {success && (
          <p className="mt-3 text-center text-green-700 font-semibold text-sm">
            {t("provider.dashboard.success")}
          </p>
        )}

        {/* Dernière mise à jour */}
        <p className="mt-4 text-center text-xs text-gray-400">
          {lastUpdate
            ? t("provider.dashboard.last_update", { date: lastUpdate })
            : t("provider.dashboard.never_updated")}
        </p>
      </div>
    </div>
  )
}
