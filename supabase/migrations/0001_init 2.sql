-- ================================================
--  Dodocesoir — schéma initial
--  Exécuter dans Supabase → SQL Editor
-- ================================================

-- Types enums
CREATE TYPE accommodation_type AS ENUM (
  'gite', 'chambre_hote', 'hotel', 'camping', 'auberge', 'other'
);

-- ── Table principale : hébergements ─────────────────────────
CREATE TABLE public.accommodations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  stg             SMALLINT    NOT NULL,                          -- numéro d'étape
  town            TEXT        NOT NULL,
  name            TEXT        NOT NULL,
  type            accommodation_type,
  email           TEXT,
  website         TEXT,
  phone           TEXT,
  address         TEXT,
  host            TEXT,
  open_season     TEXT,                                          -- période ouverture (texte libre)
  -- Capacité / prix
  shared_beds     TEXT,                                          -- ex : "4/14"
  price_bed       TEXT,                                          -- ex : "16€"
  private_rooms   TEXT,
  price_room      TEXT,
  -- Services booleans
  breakfast       BOOLEAN,
  dinner          BOOLEAN,
  kitchen         BOOLEAN,
  wifi            BOOLEAN,
  bike_storage    BOOLEAN,
  disability_access BOOLEAN,
  -- Divers
  notes           TEXT,
  -- GPS
  lat             DOUBLE PRECISION,
  lng             DOUBLE PRECISION,
  gps_precision   TEXT        DEFAULT 'town' CHECK (gps_precision IN ('exact','town')),
  -- i18n (JSONB) — ex : {"en":{"name":"…","description":"…"},"es":{…}}
  translations    JSONB       DEFAULT '{}',
  -- Liaison hébergeur
  provider_email  TEXT,                                          -- email du propriétaire (pour invitation)
  is_registered   BOOLEAN     DEFAULT FALSE,                    -- a-t-il activé son compte ?
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_acc_stg   ON public.accommodations(stg);
CREATE INDEX idx_acc_geo   ON public.accommodations(lat, lng);

-- ── Disponibilité actuelle (un seul enregistrement par hébergement) ──
-- Pattern "upsert" : on met à jour la même ligne chaque jour.
-- Si updated_at > 7 jours → considéré comme expiré.
CREATE TABLE public.availability (
  accommodation_id UUID        PRIMARY KEY REFERENCES public.accommodations(id) ON DELETE CASCADE,
  is_available     BOOLEAN     NOT NULL,
  capacity         SMALLINT,                                    -- places restantes (optionnel)
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Lien hébergeur ←→ compte auth ────────────────────────────
-- Créé automatiquement à la première connexion du hébergeur (via OTP).
CREATE TABLE public.providers (
  user_id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  accommodation_id UUID        UNIQUE NOT NULL REFERENCES public.accommodations(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ── Vue : hébergements + disponibilité avec statut calculé ──
-- Le front lit cette vue pour afficher la carte.
CREATE OR REPLACE VIEW public.v_accommodations AS
SELECT
  a.*,
  av.is_available,
  av.capacity,
  av.updated_at                                                  AS availability_updated_at,
  CASE
    WHEN av.updated_at IS NULL                                  THEN 'unknown'
    WHEN av.updated_at < NOW() - INTERVAL '7 days'             THEN 'expired'
    WHEN av.is_available                                        THEN 'available'
    ELSE                                                             'full'
  END                                                            AS availability_status
FROM public.accommodations a
LEFT JOIN public.availability av ON a.id = av.accommodation_id;

-- La vue doit être lisible par anon (pas de RLS sur les tables source bloquant)
GRANT SELECT ON public.v_accommodations TO anon, authenticated;

-- ── Row Level Security (RLS) ─────────────────────────────────

-- accommodations : lecture publique, mise à jour limitée au provider lié
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acc_read_all"
  ON public.accommodations FOR SELECT USING (true);

CREATE POLICY "acc_update_own"
  ON public.accommodations FOR UPDATE
  USING (id IN (SELECT accommodation_id FROM public.providers WHERE user_id = auth.uid()))
  WITH CHECK (id IN (SELECT accommodation_id FROM public.providers WHERE user_id = auth.uid()));

-- availability : lecture publique, upsert par le provider lié
ALTER TABLE public.availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "avail_read_all"
  ON public.availability FOR SELECT USING (true);

CREATE POLICY "avail_insert_own"
  ON public.availability FOR INSERT
  WITH CHECK (accommodation_id IN (SELECT accommodation_id FROM public.providers WHERE user_id = auth.uid()));

CREATE POLICY "avail_update_own"
  ON public.availability FOR UPDATE
  USING (accommodation_id IN (SELECT accommodation_id FROM public.providers WHERE user_id = auth.uid()));

-- providers : un utilisateur ne voit que son propre enregistrement ; peut en créer un
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prov_read_own"
  ON public.providers FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "prov_insert_own"
  ON public.providers FOR INSERT WITH CHECK (user_id = auth.uid());
