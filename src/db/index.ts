import "server-only";
import path from "node:path";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

const MIGRATIONS = path.join(process.cwd(), "drizzle");

// En ligne : DATABASE_URL (Supabase). En local sans DATABASE_URL : Postgres embarqué (PGlite) dans .data/.
async function connect(): Promise<DB> {
  // DATABASE_URL si défini à la main, sinon POSTGRES_URL posé par l'intégration Supabase de Vercel (pooler).
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (url) {
    const { default: postgres } = await import("postgres");
    const { drizzle } = await import("drizzle-orm/postgres-js");
    const { migrate } = await import("drizzle-orm/postgres-js/migrator");
    // Les paramètres d'URL de Supabase (sslmode, supa…) seraient envoyés au serveur comme réglages : on les retire
    // et on impose le SSL. prepare: false pour le pooler en mode transaction.
    const clean = new URL(url);
    clean.search = "";
    const local = ["localhost", "127.0.0.1"].includes(clean.hostname);
    const db = drizzle(postgres(clean.toString(), { prepare: false, max: 5, ssl: local ? false : "require" }), { schema });
    await migrate(db, { migrationsFolder: MIGRATIONS });
    return db as unknown as DB;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dir = process.env.PGLITE_DIR || path.join(process.cwd(), ".data", "qg");
  // PGlite ne crée pas les dossiers parents : premier lancement sur une machine vierge.
  const { mkdirSync } = await import("node:fs");
  mkdirSync(path.dirname(dir), { recursive: true });
  const db = drizzle(new PGlite(dir), { schema });
  await migrate(db, { migrationsFolder: MIGRATIONS });
  return db as unknown as DB;
}

// Une seule connexion par process, y compris à travers les rechargements du serveur de dev.
const g = globalThis as unknown as { __qgDb?: Promise<DB> };

export function getDb(): Promise<DB> {
  g.__qgDb ??= connect().catch((err) => {
    g.__qgDb = undefined;
    throw err;
  });
  return g.__qgDb;
}

export { schema };
