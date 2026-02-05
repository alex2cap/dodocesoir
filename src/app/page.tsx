import { supabase } from "@/lib/supabase"
import MapPage from "@/components/MapPage.client"
import type { Accommodation } from "@/types"

export default async function Home() {
  const { data, error } = await supabase
    .from("v_accommodations")
    .select("*")
    .order("stg, town")

  if (error) {
    console.error("Erreur Supabase :", error)
    return (
      <div className="flex h-screen items-center justify-center text-red-600">
        Erreur de chargement des données.
      </div>
    )
  }

  return <MapPage accommodations={data as Accommodation[]} />
}
