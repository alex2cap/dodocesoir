# Dodocesoir — scaffold

App Next.js + Supabase pour les hébergements du Chemin de Santiago (Le Puy → Conques).

---

## 1. Prérequis

- Node.js ≥ 18
- Un compte [Supabase](https://supabase.com) (free tier suffit)
- Un compte [Vercel](https://vercel.com) pour le déploiement

---

## 2. Supabase — base de données

1. Créez un nouveau projet sur supabase.com.
2. Ouvrez **SQL Editor**.
3. Copiez-collez le contenu de `supabase/migrations/0001_init.sql` et exécutez.
4. Vérifiez dans **Table Editor** que les tables `accommodations`, `availability`, `providers` et la vue `v_accommodations` sont créées.
5. Dans **Settings → API**, copiez :
   - `Project URL`
   - `anon` key (public)

---

## 3. Installation locale

```bash
git clone <ce-repo>   # ou téléchargez le dossier
cd dodocesoir
npm install
```

Créez un fichier `.env.local` à la racine (copiez `.env.local.example`) :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

```bash
npm run dev   # → http://localhost:3000
```

---

## 4. Importer les hébergements

À ce stade la table `accommodations` est vide. Pour la peupler :

- Exportez votre Excel nettoyé en CSV.
- Dans Supabase → **Table Editor → accommodations → Import data**, uploadez le CSV.
- Ou utilisez un script Python + `supabase-py` pour mapper les colonnes.

**Champs clés à remplir avant import :**
- `lat` / `lng` (géocodage — voir section 6)
- `provider_email` (email du propriétaire, pour l'invitation)

---

## 5. Déploiement sur Vercel

1. Connectez votre repo GitHub à Vercel.
2. Dans les **Environment Variables** du projet Vercel, ajoutez les deux variables du `.env.local`.
3. Déployez → votre app est en ligne.

---

## 6. Géocodage des adresses

Les GPS sont partiellement remplis dans votre fichier source.
Pour géocoder automatiquement les adresses manquantes (Nominatim / OpenStreetMap, gratuit) :

→ À faire dans une prochaine étape — script Python fourni séparément.

---

## 7. Inviter les hébergeurs

1. Dans Supabase → **Auth → Settings**, activez **Email → OTP** (6 digits).
2. Pour chaque hébergeur, envoyer un email avec le lien : `https://votre-app.vercel.app/provider/login`
3. À leur première connexion, le lien `providers` est créé automatiquement.

---

## Structure du projet

```
src/
├── app/
│   ├── layout.tsx              # Root layout + I18nProvider
│   ├── page.tsx                # Home — fetch server-side, rend MapPage
│   └── provider/
│       ├── login/page.tsx      # Auth OTP hébergeur
│       └── dashboard/page.tsx  # Mise à jour disponibilité
├── components/
│   ├── MapPage.client.tsx      # Wrapper client : état de recherche + filtres
│   ├── Map.client.tsx          # Carte Leaflet (client only)
│   ├── AccommodationPopup.tsx  # Génère le HTML des popups Leaflet
│   ├── SearchPanel.client.tsx  # Barre de recherche + filtres + légende
│   ├── GeolocateButton.client.tsx
│   └── LanguageSwitcher.client.tsx
├── i18n/
│   ├── provider.tsx            # Context + hook useI18n()
│   └── locales/                # fr, en, es, de, it
├── lib/
│   └── supabase.ts             # Client Supabase singleton
└── types/
    └── index.ts                # TypeScript types
```

---

## À faire ensuite

- [ ] Importer les 282 hébergements
- [ ] Géocoder les adresses manquantes
- [ ] Envoyer les invitations aux hébergeurs
- [ ] Tester le flux complet (carte → popup → provider login → update → rafraîchi)
- [ ] Ajuster le périmètre géographique (centre carte, zoom initial)
