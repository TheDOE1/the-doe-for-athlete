# The Doe For Athlete — Guide de Déploiement

## Stack

| Couche | Service | Gratuit |
|--------|---------|---------|
| Hébergement | [Vercel](https://vercel.com) | ✓ Hobby tier |
| Base de données | [Neon](https://neon.tech) | ✓ Free tier (0.5 GB) |
| Authentification | Auth.js v5 (intégré) | ✓ |

---

## Phase 7 — Base de données locale

### Prérequis
- PostgreSQL local **ou** compte Neon gratuit
- Node.js 18+

### Option A — PostgreSQL local

```bash
# Créer la base de données
createdb the_doe_for_athlete

# Configurer .env.local
cp .env.example .env.local
# Éditer DATABASE_URL avec vos identifiants locaux
```

### Option B — Neon (recommandé)

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet "the-doe-for-athlete"
3. Copier la **Connection string** (format `postgresql://...?sslmode=require`)
4. Coller dans `.env.local` → `DATABASE_URL`

### Migrations & Seed

```bash
# 1. Générer les migrations (déjà fait, fichiers dans src/server/db/migrations/)
pnpm db:generate

# 2. Appliquer les migrations à la DB
pnpm db:migrate

# 3. Peupler la DB avec les données de démo
pnpm db:seed
```

Après le seed, vous pouvez vous connecter avec :

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@thedoefc.com` | `Admin123!` | Admin |
| `coach@thedoefc.com` | `Coach123!` | Head Coach |
| `physio@thedoefc.com` | `Physio123!` | Physio |

### Drizzle Studio (interface graphique DB)

```bash
pnpm db:studio
# Ouvre https://local.drizzle.studio
```

---

## Phase 8 — Déploiement Vercel

### Étape 1 — Préparer le repository

```bash
git add .
git commit -m "feat: ready for production deployment"
git push origin main
```

### Étape 2 — Créer le projet Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Importer le repository GitHub
3. Framework détecté automatiquement : **Next.js**
4. Cliquer **Deploy** (le premier déploiement échouera sans les variables d'env — c'est normal)

### Étape 3 — Variables d'environnement Vercel

Dans **Vercel Dashboard → Settings → Environment Variables**, ajouter :

| Variable | Valeur | Env |
|----------|--------|-----|
| `DATABASE_URL` | URL Neon avec `?sslmode=require` | Production, Preview |
| `AUTH_SECRET` | `openssl rand -base64 32` | Production, Preview |
| `AUTH_URL` | `https://your-app.vercel.app` | Production |
| `AUTH_URL` | `https://your-preview.vercel.app` | Preview |

### Étape 4 — Redéployer

```bash
# Depuis le dashboard Vercel : Deployments → Redeploy
# Ou via CLI :
vercel --prod
```

### Étape 5 — Appliquer les migrations en production

```bash
# Avec la DATABASE_URL de production dans votre terminal :
DATABASE_URL="postgresql://..." pnpm db:migrate

# Puis le seed (optionnel en prod) :
DATABASE_URL="postgresql://..." pnpm db:seed
```

---

## Structure des scripts DB

```bash
pnpm db:generate      # Génère les migrations SQL depuis le schema TypeScript
pnpm db:migrate       # Applique les migrations via drizzle-kit
pnpm db:migrate:run   # Applique les migrations via le runner custom (tsx)
pnpm db:push          # Push direct du schema (dev uniquement, sans migration)
pnpm db:studio        # Ouvre Drizzle Studio (GUI DB)
pnpm db:seed          # Peuple la DB avec les données de démo
```

---

## Checklist de déploiement

- [ ] `DATABASE_URL` configurée (Neon avec `?sslmode=require`)
- [ ] `AUTH_SECRET` générée (`openssl rand -base64 32`)
- [ ] `AUTH_URL` = URL de production Vercel
- [ ] Migrations appliquées en production
- [ ] Build Vercel sans erreurs
- [ ] Login fonctionnel avec `admin@thedoefc.com`

---

## Troubleshooting

### `DATABASE_URL is not set`
→ Vérifier que `.env.local` existe et contient `DATABASE_URL`

### `Connection refused`
→ Vérifier que PostgreSQL est lancé localement, ou que l'URL Neon est correcte

### `Too many connections`
→ Normal en développement. En production, le `max: 1` dans `src/server/db/index.ts` limite les connexions pour serverless.

### Auth ne fonctionne pas
→ Vérifier `AUTH_SECRET` (doit être identique entre builds). Regénérer : `openssl rand -base64 32`

### Vercel build échoue sur `@react-three/fiber`
→ Ajouter dans `next.config.ts` :
```ts
transpilePackages: ['three', '@react-three/fiber', '@react-three/drei']
```
