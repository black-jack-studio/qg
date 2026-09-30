# QG

Le QG de Stan & Anat : toutes nos apps au même endroit. Pour chaque app, les tâches (liste ou kanban), les accès, la stack avec ce qu'elle coûte, les notes et les liens. « Commun » regroupe ce qui est partagé entre les apps (compte Apple Developer, équipe Vercel…).

## Lancer en local

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000. La base est créée toute seule dans `.data/` (Postgres embarqué, rien à installer). Sans `QG_ACCESS_CODE`, pas d'écran de code en local.

## En ligne

Projet Vercel `st-an/qg` (https://qg-sooty.vercel.app), base Supabase `qg-db` ajoutée via le Marketplace Vercel : elle fournit `POSTGRES_URL` à la prod, aux previews et au dev (`vercel env pull`). `QG_ACCESS_CODE` est défini pour la prod et les previews. Les tables se créent au premier chargement.

Avec un `.env.local` issu de `vercel env pull`, `npm run dev` travaille sur la base en ligne. Sans lui, il repart sur la base embarquée de `.data/`.

Déployer : `vercel deploy --prod`.

Le site envoie `noindex` partout (en-tête, meta, robots.txt) et demande le code une fois par appareil.

## Stack

Next.js 16 (App Router, Server Actions), Tailwind v4, Drizzle ORM. Schéma : `src/db/schema.ts`. Après une modification du schéma : `npx drizzle-kit generate`.
