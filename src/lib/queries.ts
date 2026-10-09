import "server-only";
import { and, asc, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import { getDb, schema } from "@/db";
import { COMMUN } from "./meta";

const { apps, tasks, credentials, services, notes, links } = schema;

/** "commun" → null, "12" → 12, sinon undefined (introuvable). */
export function parseScope(param: string): number | null | undefined {
  if (param === COMMUN) return null;
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function byScope(column: PgColumn, appId: number | null): SQL {
  return appId === null ? isNull(column) : eq(column, appId);
}

export async function listApps() {
  const db = await getDb();
  const rows = await db.select().from(apps).orderBy(asc(apps.position), asc(apps.id));
  const counts = await db
    .select({
      appId: tasks.appId,
      open: sql<number>`count(*) filter (where ${tasks.status} <> 'done')`.mapWith(Number),
      done: sql<number>`count(*) filter (where ${tasks.status} = 'done')`.mapWith(Number),
      urgent: sql<number>`count(*) filter (where ${tasks.status} <> 'done' and ${tasks.priority} = 'haute')`.mapWith(Number),
    })
    .from(tasks)
    .groupBy(tasks.appId);
  const byApp = new Map(counts.map((c) => [c.appId, c]));
  const empty = { open: 0, done: 0, urgent: 0 };
  return {
    apps: rows.map((a) => ({ ...a, ...(byApp.get(a.id) ?? empty) })),
    commun: byApp.get(null) ?? empty,
  };
}
export type AppWithCounts = Awaited<ReturnType<typeof listApps>>["apps"][number];

export async function getApp(id: number) {
  const db = await getDb();
  const [app] = await db.select().from(apps).where(eq(apps.id, id));
  return app ?? null;
}

export async function listTasks(appId?: number | null) {
  const db = await getDb();
  return db
    .select()
    .from(tasks)
    .where(appId === undefined ? undefined : byScope(tasks.appId, appId))
    .orderBy(asc(tasks.position), desc(tasks.id));
}

export async function listCredentials(appId?: number | null) {
  const db = await getDb();
  return db
    .select()
    .from(credentials)
    .where(appId === undefined ? undefined : byScope(credentials.appId, appId))
    .orderBy(asc(credentials.service));
}

export async function listServices(appId?: number | null) {
  const db = await getDb();
  return db
    .select()
    .from(services)
    .where(appId === undefined ? undefined : byScope(services.appId, appId))
    .orderBy(asc(services.category), asc(services.name));
}

export async function listNotes(appId?: number | null) {
  const db = await getDb();
  return db
    .select()
    .from(notes)
    .where(appId === undefined ? undefined : byScope(notes.appId, appId))
    .orderBy(desc(notes.pinned), desc(notes.updatedAt));
}

export async function listLinks(appId?: number | null) {
  const db = await getDb();
  return db
    .select()
    .from(links)
    .where(appId === undefined ? undefined : byScope(links.appId, appId))
    .orderBy(asc(links.id));
}

export async function scopeCounts(appId: number | null) {
  const db = await getDb();
  const count = (table: typeof tasks | typeof credentials | typeof services | typeof notes | typeof links, extra?: SQL) =>
    db
      .select({ n: sql<number>`count(*)`.mapWith(Number) })
      .from(table)
      .where(and(byScope(table.appId, appId), extra))
      .then((r) => r[0]?.n ?? 0);
  const [openTasks, creds, svc, noteCount, linkCount] = await Promise.all([
    count(tasks, sql`${tasks.status} <> 'done'`),
    count(credentials),
    count(services),
    count(notes),
    count(links),
  ]);
  return { openTasks, creds, svc, notes: noteCount + linkCount };
}
