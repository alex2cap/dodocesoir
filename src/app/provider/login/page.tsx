"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useI18n } from "@/i18n/provider"

export default function ProviderLogin() {
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")  // 2 étapes
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // ── Étape 1 : envoyer le code OTP ───────────────────────
  async function sendOtp() {
  setLoading(true)
  setError("")
  
  // Vérifier si l'email existe dans accommodations
  const { data: accommodation } = await supabase
    .from("accommodations")
    .select("email")
    .eq("email", email.trim().toLowerCase())
    .single()
  
  if (!accommodation) {
    setError(t("provider.login.error_email"))
    setLoading(false)
    return
  }
  
  const { error: err } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  })
  setLoading(false)
  if (err) {
    setError(t("provider.login.error_email"))
  } else {
    setStep("otp")
  }
}

  // ── Étape 2 : vérifier le code ──────────────────────────
  async function verifyOtp() {
    setLoading(true)
    setError("")
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "magiclink",
    })
    setLoading(false)
    if (err) {
      setError(t("provider.login.error_code"))
    } else {
      // Rediriger vers le dashboard après un court délai (auth se propage)
      setTimeout(() => { window.location.href = "/provider/dashboard" }, 500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        {/* Logo / titre */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Dodocesoir</h1>
          <p className="text-sm text-gray-500 mt-1">{t("provider.login.title")}</p>
        </div>

        {step === "email" ? (
          <>
            <p className="text-sm text-gray-600 mb-4">{t("provider.login.description")}</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("provider.login.email_placeholder")}
              onKeyDown={(e) => e.key === "Enter" && sendOtp()}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={sendOtp}
              disabled={loading || !email}
              className="w-full mt-4 py-3 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {loading ? t("provider.login.sending") : t("provider.login.submit")}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-600 mb-1">Code envoyé à <strong>{email}</strong></p>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder={t("provider.login.otp_placeholder")}
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 tracking-widest text-center"
              autoFocus
            />
            <button
              onClick={verifyOtp}
              disabled={loading || otp.length < 6}
              className="w-full mt-4 py-3 bg-green-600 text-white rounded-xl font-semibold disabled:opacity-50 active:scale-95 transition"
            >
              {loading ? "…" : t("provider.login.verify")}
            </button>
            <button
              onClick={() => { setStep("email"); setOtp("") }}
              className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700"
            >
              {t("provider.login.back")}
            </button>
          </>
        )}

        {error && <p className="mt-3 text-sm text-red-600 text-center">{error}</p>}

        {/* Lien retour carte */}
        <a href="/" className="block mt-8 text-center text-xs text-gray-400 hover:text-gray-600">← Retour à la carte</a>
      </div>
    </div>
  )
}
