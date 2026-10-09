"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, schema } from "@/db";
import { ACCESS_COOKIE, accessCode, accessToken } from "@/lib/access";
import { APP_COLORS, APP_STATUSES, PAYERS, PEOPLE, PRIORITIES, SERVICE_CATEGORIES, TASK_STATUSES } from "@/lib/meta";

const { apps, tasks, credentials, services, notes, links } = schema;

const refresh = () => revalidatePath("/", "layout");

function str(form: FormData, key: string, max = 5000): string {
  return String(form.get(key) ?? "").trim().slice(0, max);
}
function oneOf<T extends Record<string, string>>(value: unknown, table: T, fallback: keyof T): keyof T {
  return typeof value === "string" && value in table ? (value as keyof T) : fallback;
}
function scopeFrom(form: FormData): number | null {
  const raw = form.get("appId");
  const id = Number(raw);
  return raw && Number.isInteger(id) && id > 0 ? id : null;
}
function cleanUrl(raw: string): string {
  if (!raw) return "";
  return /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
}

// ── Accès ─────────────────────────────────────────────────────────

export async function enter(_prev: { error?: string } | undefined, form: FormData) {
  const code = accessCode();
  const given = str(form, "code", 200);
  if (code && given !== code) return { error: "Code incorrect. Réessaie, ou demande-le à l'autre." };
  const jar = await cookies();
  jar.set(ACCESS_COOKIE, await accessToken(code ?? ""), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 400,
    path: "/",
  });
  redirect("/");
}

// ── Apps ──────────────────────────────────────────────────────────

export async function createApp(form: FormData) {
  const name = str(form, "name", 80);
  if (!name) return;
  const db = await getDb();
  const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${apps.position}), 0)`.mapWith(Number) }).from(apps);
  const [row] = await db
    .insert(apps)
    .values({
      name,
      emoji: str(form, "emoji", 16) || "📱",
      color: oneOf(form.get("color"), APP_COLORS, "blue") as string,
      status: oneOf(form.get("status"), APP_STATUSES, "dev") as string,
      description: str(form, "description", 400),
      platforms: form.getAll("platforms").map(String).join(","),
      position: max + 1,
    })
    .returning({ id: apps.id });
  refresh();
  redirect(`/apps/${row.id}`);
}

export async function updateApp(id: number, form: FormData) {
  const name = str(form, "name", 80);
  if (!name) return;
  const db = await getDb();
  await db
    .update(apps)
    .set({
      name,
      emoji: str(form, "emoji", 16) || "📱",
      color: oneOf(form.get("color"), APP_COLORS, "blue") as string,
      status: oneOf(form.get("status"), APP_STATUSES, "dev") as string,
      description: str(form, "description", 400),
      platforms: form.getAll("platforms").map(String).join(","),
    })
    .where(eq(apps.id, id));
  refresh();
  redirect(`/apps/${id}`);
}

export async function deleteApp(id: number) {
  const db = await getDb();
  await db.delete(apps).where(eq(apps.id, id));
  refresh();
  redirect("/");
}

// ── Tâches ────────────────────────────────────────────────────────

export async function createTask(form: FormData) {
  const title = str(form, "title", 300);
  if (!title) return;
  const status = oneOf(form.get("status"), TASK_STATUSES, "todo") as string;
  const db = await getDb();
  const [{ min }] = await db
    .select({ min: sql<number>`coalesce(min(${tasks.position}), 0)`.mapWith(Number) })
    .from(tasks);
  await db.insert(tasks).values({
    appId: scopeFrom(form),
    title,
    status,
    priority: oneOf(form.get("priority"), PRIORITIES, "normale") as string,
    assignee: str(form, "assignee") in PEOPLE ? str(form, "assignee") : null,
    dueDate: /^\d{4}-\d{2}-\d{2}$/.test(str(form, "dueDate")) ? str(form, "dueDate") : null,
    position: min - 1,
    doneAt: status === "done" ? new Date() : null,
  });
  refresh();
}

export type TaskPatch = {
  title?: string;
  details?: string;
  status?: string;
  priority?: string;
  assignee?: string | null;
  dueDate?: string | null;
  appId?: number | null;
};

export async function updateTask(id: number, patch: TaskPatch) {
  const set: Partial<typeof tasks.$inferInsert> = {};
  if (patch.title !== undefined && patch.title.trim()) set.title = patch.title.trim().slice(0, 300);
  if (patch.details !== undefined) set.details = patch.details.slice(0, 10000);
  if (patch.status !== undefined && patch.status in TASK_STATUSES) {
    set.status = patch.status;
    set.doneAt = patch.status === "done" ? new Date() : null;
  }
  if (patch.priority !== undefined && patch.priority in PRIORITIES) set.priority = patch.priority;
  if (patch.assignee !== undefined) set.assignee = patch.assignee && patch.assignee in PEOPLE ? patch.assignee : null;
  if (patch.dueDate !== undefined) set.dueDate = patch.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(patch.dueDate) ? patch.dueDate : null;
  if (patch.appId !== undefined) set.appId = patch.appId;
  if (Object.keys(set).length === 0) return;
  const db = await getDb();
  await db.update(tasks).set(set).where(eq(tasks.id, id));
  refresh();
}

/** Déplace une tâche dans une colonne et fixe l'ordre de cette colonne. */
export async function moveTask(id: number, status: string, orderedIds: number[]) {
  if (!(status in TASK_STATUSES)) return;
  const db = await getDb();
  await db.transaction(async (tx) => {
    const [current] = await tx.select({ status: tasks.status }).from(tasks).where(eq(tasks.id, id));
    if (!current) return;
    if (current.status !== status) {
      await tx
        .update(tasks)
        .set({ status, doneAt: status === "done" ? new Date() : null })
        .where(eq(tasks.id, id));
    }
    const ids = orderedIds.filter((n) => Number.isInteger(n)).slice(0, 500);
    for (const [i, taskId] of ids.entries()) {
      await tx.update(tasks).set({ position: i }).where(eq(tasks.id, taskId));
    }
  });
  refresh();
}

export async function deleteTask(id: number) {
  const db = await getDb();
  await db.delete(tasks).where(eq(tasks.id, id));
  refresh();
}

export async function clearDoneTasks(ids: number[]) {
  if (ids.length === 0) return;
  const db = await getDb();
  await db.delete(tasks).where(and(inArray(tasks.id, ids.slice(0, 1000)), eq(tasks.status, "done")));
  refresh();
}

// ── Identifiants ──────────────────────────────────────────────────

function credentialValues(form: FormData) {
  return {
    service: str(form, "service", 120),
    url: cleanUrl(str(form, "url", 500)),
    username: str(form, "username", 200),
    password: String(form.get("password") ?? "").slice(0, 500),
    notes: str(form, "notes", 2000),
    appId: scopeFrom(form),
  };
}

export async function saveCredential(id: number | null, form: FormData) {
  const values = credentialValues(form);
  if (!values.service) return;
  const db = await getDb();
  if (id) await db.update(credentials).set({ ...values, updatedAt: new Date() }).where(eq(credentials.id, id));
  else await db.insert(credentials).values(values);
  refresh();
}

export async function deleteCredential(id: number) {
  const db = await getDb();
  await db.delete(credentials).where(eq(credentials.id, id));
  refresh();
}

// ── Stack ─────────────────────────────────────────────────────────

function serviceValues(form: FormData) {
  const cost = Number(str(form, "cost", 20).replace(",", ".").replace(/[^\d.]/g, ""));
  return {
    name: str(form, "name", 120),
    category: oneOf(form.get("category"), SERVICE_CATEGORIES, "autre") as string,
    url: cleanUrl(str(form, "url", 500)),
    plan: str(form, "plan", 120),
    monthlyCostCents: Number.isFinite(cost) ? Math.round(cost * 100) : 0,
    account: str(form, "account", 200),
    payer: oneOf(form.get("payer"), PAYERS, "commun") as string,
    notes: str(form, "notes", 2000),
    appId: scopeFrom(form),
  };
}

export async function saveService(id: number | null, form: FormData) {
  const values = serviceValues(form);
  if (!values.name) return;
  const db = await getDb();
  if (id) await db.update(services).set(values).where(eq(services.id, id));
  else await db.insert(services).values(values);
  refresh();
}

export async function deleteService(id: number) {
  const db = await getDb();
  await db.delete(services).where(eq(services.id, id));
  refresh();
}

// ── Notes & liens ─────────────────────────────────────────────────

export async function createNote(appId: number | null) {
  const db = await getDb();
  const [row] = await db.insert(notes).values({ appId, title: "", body: "" }).returning({ id: notes.id });
  refresh();
  return row.id;
}

export async function saveNote(id: number, patch: { title?: string; body?: string; pinned?: boolean; appId?: number | null }) {
  const db = await getDb();
  await db
    .update(notes)
    .set({
      ...(patch.title !== undefined && { title: patch.title.slice(0, 200) }),
      ...(patch.body !== undefined && { body: patch.body.slice(0, 100_000) }),
      ...(patch.pinned !== undefined && { pinned: patch.pinned }),
      ...(patch.appId !== undefined && { appId: patch.appId }),
      updatedAt: new Date(),
    })
    .where(eq(notes.id, id));
  refresh();
}

export async function deleteNote(id: number) {
  const db = await getDb();
  await db.delete(notes).where(eq(notes.id, id));
  refresh();
}

export async function createLink(form: FormData) {
  const url = cleanUrl(str(form, "url", 1000));
  if (!url) return;
  const label = str(form, "label", 120) || url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const db = await getDb();
  await db.insert(links).values({ appId: scopeFrom(form), label, url });
  refresh();
}

export async function deleteLink(id: number) {
  const db = await getDb();
  await db.delete(links).where(eq(links.id, id));
  refresh();
}
