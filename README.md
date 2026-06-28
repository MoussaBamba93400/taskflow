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

## Déploiement

- **Front** : Vercel, *Root Directory* = `apps/taskflow`. Renseignez
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, et
  `NEXT_PUBLIC_API_URL` (URL publique de l'API Express).
- **API Express** : déployez `server/` sur un service Node (Railway, Render, Fly…)
  avec `npm run start:server`. Renseignez `CORS_ORIGIN` (= l'URL du front),
  `API_PORT`, et les variables Supabase.

## Stack

Next.js 15 · React 19 · TypeScript strict · Express 4 · @supabase/ssr ·
@dnd-kit · CSS Modules (aucune librairie UI).
