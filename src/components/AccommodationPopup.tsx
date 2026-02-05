import type { Accommodation } from "@/types"

// Couleurs badge — cohérent avec les marqueurs
const BADGE_BG: Record<string, string> = {
  available: "#dcfce7",
  full: "#fee2e2",
  expired: "#f3f4f6",
  unknown: "#f3f4f6",
}
const BADGE_TEXT: Record<string, string> = {
  available: "#166534",
  full: "#991b1b",
  expired: "#6b7280",
  unknown: "#6b7280",
}

export function createPopupHtml(
  acc: Accommodation,
  t: (key: string, params?: Record<string, string>) => string
): string {
  const status = acc.availability_status
  const statusLabel = t(`availability.${status}`)
  const bg = BADGE_BG[status] || BADGE_BG.unknown
  const fg = BADGE_TEXT[status] || BADGE_TEXT.unknown

  // Date de mise à jour formatée
  let updateLine = ""
  if (acc.availability_updated_at) {
    const d = new Date(acc.availability_updated_at)
    const formatted = d.toLocaleDateString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
    updateLine = status === "expired"
      ? `<p style="font-size:11px;color:#9ca3af;margin:2px 0 0">${t("popup.expired")}</p>`
      : `<p style="font-size:11px;color:#9ca3af;margin:2px 0 0">${t("popup.last_update", { date: formatted })}</p>`
  }

  // Services en une ligne
  const services = [
    acc.breakfast && `🍞 ${t("popup.breakfast")}`,
    acc.dinner && `🍲 ${t("popup.dinner")}`,
    acc.kitchen && `🍳 ${t("popup.kitchen")}`,
    acc.wifi && "📶 Wifi",
  ].filter(Boolean).join("  ·  ")

  // Liens de contact
  const links = [
    acc.phone ? `<a href="tel:${acc.phone.replace(/[^+\d]/g, "")}" style="color:#2563eb">📞 Appeler</a>` : "",
    acc.website ? `<a href="${acc.website}" target="_blank" rel="noopener" style="color:#2563eb">${t("popup.website")}</a>` : "",
    acc.email && acc.email !== "no email" ? `<a href="mailto:${acc.email}" style="color:#2563eb">✉ Email</a>` : "",
  ].filter(Boolean).join("  ·  ")

  return `
    <div style="font-family: system-ui, sans-serif; padding: 2px;">
      <h3 style="margin:0 0 2px; font-size:15px; font-weight:600; line-height:1.3;">${acc.name}</h3>
      <p style="margin:0; font-size:12px; color:#6b7280;">${acc.town} — ${t("popup.stage")} ${acc.stg}</p>

      <!-- Badge disponibilité -->
      <div style="margin:8px 0 4px;">
        <span style="display:inline-block; background:${bg}; color:${fg}; font-size:12px; font-weight:600; padding:3px 8px; border-radius:12px;">
          ${statusLabel}
        </span>
        ${acc.capacity ? `<span style="font-size:11px; color:#6b7280; margin-left:6px;">${acc.capacity} place${acc.capacity > 1 ? "s" : ""}</span>` : ""}
      </div>
      ${updateLine}

      <!-- Services -->
      ${services ? `<p style="margin:6px 0 2px; font-size:11px; color:#4b5563;">${services}</p>` : ""}

      <!-- Contact -->
      ${links ? `<div style="margin-top:6px; font-size:12px; display:flex; gap:10px;">${links}</div>` : ""}
    </div>
  `
}
