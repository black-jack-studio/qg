import { Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { StatusBadge } from "@/components/badges";
import { NotesAndLinks } from "@/components/notes";
import { Page } from "@/components/page-header";
import { Stack } from "@/components/stack";
import { TaskBoard } from "@/components/task-board";
import { Vault } from "@/components/vault";
import { boardApps } from "@/lib/board-apps";
import { appColor } from "@/lib/meta";
import { getApp, listCredentials, listLinks, listNotes, listServices, listTasks, parseScope, scopeCounts } from "@/lib/queries";

const TABS = [
  { key: "taches", label: "Tâches" },
  { key: "acces", label: "Accès" },
  { key: "stack", label: "Stack" },
  { key: "notes", label: "Notes & liens" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const PLATFORM_LABELS: Record<string, string> = { ios: "iOS", android: "Android", web: "Web", mac: "macOS", autre: "Autre" };

async function resolve(scopeParam: string) {
  const appId = parseScope(scopeParam);
  // Plus de page « Commun » : ce qui n'est rattaché à aucune app vit dans les vues transversales (« Général »).
  if (appId === null) redirect("/");
  if (appId === undefined) notFound();
  const app = appId === null ? null : await getApp(appId);
  if (appId !== null && !app) notFound();
  return { appId, app };
}

export async function generateMetadata({ params }: PageProps<"/apps/[scope]">): Promise<Metadata> {
  const { scope } = await params;
  const appId = parseScope(scope);
  if (appId === null) return { title: "Commun" };
  const app = appId ? await getApp(appId) : null;
  return { title: app?.name ?? "App" };
}

export default async function AppPage({ params, searchParams }: PageProps<"/apps/[scope]">) {
  const { scope } = await params;
  const sp = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as Tab) : "taches";
  const { appId, app } = await resolve(scope);

  const [counts, apps] = await Promise.all([scopeCounts(appId), boardApps()]);
  const countFor: Record<Tab, number> = { taches: counts.openTasks, acces: counts.creds, stack: counts.svc, notes: counts.notes };

  const name = app?.name ?? "Commun";
  const emoji = app?.emoji ?? "🗂️";
  const color = app?.color ?? "gold";
  const platforms = app?.platforms ? app.platforms.split(",").filter(Boolean) : [];

  return (
    <Page>
      <header className="flex items-start gap-4 pb-6 sm:items-center sm:gap-5">
        <div className="relative grid size-[64px] shrink-0 place-items-center overflow-hidden rounded-[12px] bg-card text-[34px] leading-none sm:size-[84px] sm:text-[44px]">
          <span aria-hidden="true">{emoji}</span>
          <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: appColor(color) }} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[24px] break-words sm:text-[26px] font-extrabold leading-tight tracking-[-0.02em]">{name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-muted">
            {app ? <StatusBadge status={app.status} /> : <span>Comptes, services et tâches partagés entre toutes les apps</span>}
            {platforms.map((p) => (
              <span key={p} className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold">
                {PLATFORM_LABELS[p] ?? p}
              </span>
            ))}
          </div>
          {app?.description && <p className="mt-1.5 max-w-[65ch] text-[13.5px] text-muted">{app.description}</p>}
        </div>
        {app && (
          <Link href={`/apps/${app.id}/modifier`} className="btn max-sm:w-9 max-sm:px-0" aria-label="Modifier l'app">
            <Pencil size={14} />
            <span className="max-sm:hidden">Modifier</span>
          </Link>
        )}
      </header>

      <nav className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Onglets">
        <div className="inline-flex rounded-[12px] bg-card p-1 ring-1 ring-hair-soft">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Link
                key={t.key}
                href={t.key === "taches" ? `/apps/${scope}` : `/apps/${scope}?tab=${t.key}`}
                scroll={false}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-8 items-center gap-1.5 rounded-[9px] px-3 sm:px-3.5 text-[13px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                  active ? "bg-ink text-black" : "text-muted hover:text-ink"
                }`}
              >
                {t.key === "notes" ? (
                  <>
                    Notes<span className="max-sm:hidden">& liens</span>
                  </>
                ) : (
                  t.label
                )}
                <span className={`tabular-nums ${active ? "text-black/55" : "text-faint"}`}>{countFor[t.key]}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="pb-12">
        {tab === "taches" && <TaskBoard tasks={await listTasks(appId)} apps={apps} scope={appId} />}
        {tab === "acces" && <Vault credentials={await listCredentials(appId)} apps={apps} scope={appId} />}
        {tab === "stack" && <Stack services={await listServices(appId)} apps={apps} scope={appId} />}
        {tab === "notes" && <NotesAndLinks notes={await listNotes(appId)} links={await listLinks(appId)} appId={appId} />}
      </div>
    </Page>
  );
}
