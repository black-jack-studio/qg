# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js 16 (App Router, Server Actions), Tailwind v4, Drizzle ORM sur Postgres. En local : PGlite embarqué (`.data/`), aucune installation. En ligne : Postgres Supabase via `DATABASE_URL`, déployé sur Vercel. Choix délégué à Claude, hébergement en ligne partagé confirmé par Stan.

## Users

Deux personnes seulement : Stan (Stanislas Beaudoin) et Anat (Anatole Beaudoin, son cousin et associé). Ils conçoivent et maintiennent plusieurs apps (dont FaceUp, FaceUp Pairs). Ils ouvrent QG plusieurs fois par jour, sur ordinateur et sur téléphone, pour savoir ce qui reste à faire sur chaque app et retrouver un accès.

## Purpose

QG centralise tout ce qui concerne leurs apps, au lieu de Notion (mots de passe) et de notes éparses (to-do) :
- par app : tâches (liste et kanban), identifiants, stack et plateformes utilisées, notes et liens ;
- en transversal : toutes les tâches, tous les identifiants, tous les services et leur coût mensuel.

Pas de clients, pas de CRM, pas de facturation.

## Constraints

- Accès : un code unique partagé, mémorisé par appareil (cookie). Site non indexé (robots, meta, en-tête `X-Robots-Tag`).
- Les mots de passe sont stockés en clair en base : choix explicite de Stan (outil à deux, lien non partagé). Ne pas ajouter de chiffrement sans qu'il le demande.
- Interface en français.

## Brand commitments

La direction artistique reprend celle de FaceUp Pairs (`~/FaceUp Pairs/DESIGN.md`), demandée explicitement par Stan : plateau sombre `#1C1C1E`, cartes noires plates arrondies à 12px comme les boutons (écart voulu par Stan : pas d'angles droits dans QG), texte `#F5F5F5` / `#8A8A8E`, bleu système `#0A84FF` pour l'action principale seulement, accents pastel Faceup (vert, violet, bleu, or) pour les badges, police système, ni dégradé ni glow.
