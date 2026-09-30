import { ArrowUp, Plus } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/badges";
import { Page, PageHeader } from "@/components/page-header";
import { QuickTasks } from "@/components/quick-tasks";
import { boardApps } from "@/lib/board-apps";
import { PRIORITY_RANK } from "@/lib/meta";
import { listApps, listTasks } from "@/lib/queries";

export default async function Overview() {
  const [{ apps, commun }, tasks, board] = await Promise.all([listApps(), listTasks(), boardApps()]);
  const open = apps.reduce((n, a) => n + a.open, commun.open);
  const urgent = apps.reduce((n, a) => n + a.urgent, commun.urgent);

  // À faire maintenant : en cours, priorité haute, ou échéance dans les 2 jours (ou dépassée).
  const soon = new Date();
  soon.setDate(soon.getDate() + 2);
  const soonKey = soon.toISOString().slice(0, 10);
  const now = tasks
    .filter((t) => t.status !== "done" && (t.status === "doing" || t.priority === "haute" || (t.dueDate && t.dueDate <= soonKey)))
    .sort(
      (a, b) =>
        (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999") ||
        PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
        a.position - b.position,
    )
    .slice(0, 10);

  const cards = apps.map((a) => ({ ...a, href: `/apps/${a.id}` }));

  return (
    <Page>
      <PageHeader
        title="Vos apps"
        sub={
          open === 0
            ? "Aucune tâche ouverte."
            : `${open} ${open > 1 ? "tâches ouvertes" : "tâche ouverte"}${urgent ? ` · ${urgent} en priorité haute` : ""}`
        }
      >
        <Link href="/apps/nouvelle" className="btn btn-primary">
          <Plus size={15} strokeWidth={2.6} />
          Nouvelle app
        </Link>
      </PageHeader>

      {/* Le plateau : chaque app est une carte noire carrée, comme dans FaceUp Pairs. */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((c) => {
          const total = c.open + c.done;
          return (
            <Link
              key={c.id}
              href={c.href}
              className="tile group relative flex aspect-square flex-col overflow-hidden p-3.5 transition-transform duration-200 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 sm:p-4"
            >
              <div className="flex min-h-5 items-center justify-between">
                <StatusBadge status={c.status} />
                {c.urgent > 0 && <span className="inline-flex items-center gap-0.5 text-[12px] font-bold text-gold tabular-nums" title="Tâches en priorité haute">
                    <ArrowUp size={13} strokeWidth={2.6} />
                    {c.urgent}
                  </span>}
              </div>
              <div className="grid flex-1 place-items-center text-[44px] leading-none transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-110 sm:text-[52px]">
                <span aria-hidden="true">{c.emoji}</span>
              </div>
              <div>
                <p className="truncate text-[15px] font-bold sm:text-[16px]">{c.name}</p>
                <p className="mt-0.5 text-[12px] font-medium text-muted tabular-nums">
                  {c.open === 0 ? (total ? "Tout est fait" : "Aucune tâche") : `${c.open} à faire`}
                  {total > 0 && <span className="text-faint"> · {c.done}/{total}</span>}
                </p>
              </div>
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-white/[0.06]">
                <span
                  className="block h-full bg-ink/70 transition-[width] duration-500"
                  style={{ width: `${total ? (c.done / total) * 100 : 0}%` }}
                />
              </span>
            </Link>
          );
        })}
        <Link
          href="/apps/nouvelle"
          className="tile grid aspect-square place-items-center text-muted transition-colors hover:text-ink"
        >
          <span className="flex flex-col items-center gap-2 text-[13px] font-semibold">
            <Plus size={22} />
            Ajouter une app
          </span>
        </Link>
      </div>

      <section className="mt-12 pb-12">
        <div className="mb-3 flex items-baseline justify-between px-1">
          <h2 className="text-[17px] font-extrabold tracking-[-0.01em]">À faire maintenant</h2>
          <Link href="/taches" className="text-[13px] font-semibold text-muted hover:text-ink">
            Toutes les tâches
          </Link>
        </div>
        <QuickTasks tasks={now} apps={board} />
      </section>
    </Page>
  );
}
