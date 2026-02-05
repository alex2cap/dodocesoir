export type AccommodationType = "gite" | "chambre_hote" | "hotel" | "camping" | "auberge" | "other"
export type AvailabilityStatus = "available" | "full" | "unknown" | "expired"
export type Locale = "fr" | "en" | "es" | "de" | "it"

export interface Accommodation {
  id: string
  stg: number
  town: string
  name: string
  type: AccommodationType | null
  email: string | null
  website: string | null
  phone: string | null
  address: string | null
  host: string | null
  open_season: string | null
  shared_beds: string | null
  price_bed: string | null
  private_rooms: string | null
  price_room: string | null
  breakfast: boolean | null
  dinner: boolean | null
  kitchen: boolean | null
  wifi: boolean | null
  bike_storage: boolean | null
  disability_access: boolean | null
  notes: string | null
  lat: number | null
  lng: number | null
  gps_precision: "exact" | "town" | null
  translations: Record<string, { name?: string; description?: string }>
  provider_email: string | null
  is_registered: boolean
  // champs ajoutés par la vue v_accommodations
  is_available: boolean | null
  capacity: number | null
  availability_updated_at: string | null
  availability_status: AvailabilityStatus
}
