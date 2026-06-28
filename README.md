# TaskFlow — Dashboard Kanban (Fullstack)

Application de gestion de tâches avec tableau Kanban en **drag & drop**.
Authentification, projets, colonnes et tâches, le tout sécurisé par Supabase (RLS).

## Fonctionnalités

- **Auth** email / mot de passe (Supabase Auth, sessions via cookies + middleware Next.js).
- **Projets** : CRUD complet (sidebar). Chaque nouveau projet reçoit 3 colonnes par défaut.
- **Colonnes** : ajouter, renommer (double-clic), supprimer.
- **Tâches** : créer (titre, description, priorité, échéance), éditer, supprimer,
  **glisser-déposer** entre colonnes et réordonner (`@dnd-kit`).
- **Filtres** : recherche textuelle + filtre par priorité.

## Architecture

```
apps/taskflow/
├── app/                 Front Next.js (App Router)
│   ├── board/           Le tableau (client components + dnd-kit)
│   └── login/           Authentification
├── lib/                 Clients Supabase (browser/server/middleware) + client API
├── server/              API REST Express.js (process séparé)
│   ├── index.ts         Serveur + CORS + auth
│   └── routes/          tasks.ts, columns.ts
├── supabase/schema.sql  Schéma + politiques RLS
└── middleware.ts        Rafraîchit la session à chaque requête
```

### Qui fait quoi ?

- **Lecture** des projets/colonnes/tâches : directement via le client Supabase
  (RLS appliquée).
- **Écriture** des tâches et colonnes : via l'**API Express** (`POST/PATCH/DELETE
  /api/tasks`, `PATCH /api/tasks/:id/move`, `…/api/columns`). L'API valide le JWT
  Supabase de l'utilisateur et agit en son nom, donc la RLS reste la garde-fou.

## Configuration

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Dans l'éditeur SQL, exécutez [`supabase/schema.sql`](supabase/schema.sql).
3. (Optionnel) Désactivez la confirmation d'email pour tester plus vite :
   *Authentication → Providers → Email → "Confirm email" off*.
4. Copiez `.env.local.example` vers `.env.local` et renseignez vos clés :

   ```bash
   cp .env.local.example .env.local
   ```

## Lancer en local

L'app a **deux processus** : le front Next.js (port 3000) et l'API Express (port 4000).

```bash
# à la racine du monorepo
npm install
cd apps/taskflow
npm run dev          # lance Next.js + Express simultanément (concurrently)
```

Ou séparément :

```bash
npm run dev:next     # http://localhost:3000
npm run dev:server   # http://localhost:4000
```

## Déploiement (Vercel — front + API dans le même projet)

L'API Express est servie en **fonction serverless Vercel** : `api/index.ts` exporte
l'app Express, et `vercel.json` redirige `/api/*` vers cette fonction. Le front et
l'API partagent donc le **même domaine** → aucune config `NEXT_PUBLIC_API_URL`,
aucun CORS, un seul déploiement.

1. Vercel → *New Project*, *Root Directory* = `apps/taskflow`.
2. Variables d'environnement (Production + Preview) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Ne définissez pas** `NEXT_PUBLIC_API_URL` (laissé vide → appels relatifs).
3. Déployez. Le front appelle `/api/...` sur sa propre origine.

> En local, à l'inverse, le front (3000) et Express (4000) sont sur des ports
> différents : `.env.local` définit `NEXT_PUBLIC_API_URL=http://localhost:4000`.

> **Alternative** (hébergeur Node classique type Railway/Render) : lancez
> `npm run start:server`, puis renseignez sur Vercel `NEXT_PUBLIC_API_URL` (URL
> publique de l'API) et, côté API, `CORS_ORIGIN` (= URL du front).

## Stack

Next.js 15 · React 19 · TypeScript strict · Express 4 · @supabase/ssr ·
@dnd-kit · CSS Modules (aucune librairie UI).
