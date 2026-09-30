"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { updateTask } from "@/app/actions";
import type { Task } from "@/db/schema";
import { formatDue } from "@/lib/meta";
import { AppSwatch, PersonBadge } from "./badges";
import { Checkbox, type BoardApp } from "./task-board";

export function QuickTasks({ tasks, apps }: { tasks: Task[]; apps: BoardApp[] }) {
  const [items, remove] = useOptimistic(tasks, (list, id: number) => list.filter((t) => t.id !== id));
  const [, start] = useTransition();
  const appById = new Map(apps.map((a) => [a.id, a]));

  if (items.length === 0)
    return <p className="tile px-4 py-8 text-center text-[13px] text-muted">Rien d&apos;urgent. Profitez-en.</p>;

  return (
    <ul className="tile divide-y divide-hair-soft">
      {items.map((t) => {
        const app = appById.get(t.appId);
        const due = formatDue(t.dueDate);
        return (
          <li key={t.id} className="flex min-h-12 items-center gap-3 px-3 py-2">
            <Checkbox
              checked={false}
              onChange={() =>
                start(async () => {
                  remove(t.id);
                  await updateTask(t.id, { status: "done" });
                })
              }
            />
            <Link href={t.appId ? `/apps/${t.appId}` : "/taches"} className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1 sm:flex-nowrap">
              {app && <AppSwatch emoji={app.emoji} color={app.color} size={20} />}
              <span className="min-w-0 flex-1 text-[14px] font-medium sm:truncate">{t.title}</span>
              <span className="flex shrink-0 items-center gap-2.5 text-[12px] font-medium text-muted max-sm:basis-full max-sm:pl-8">
                {t.status === "doing" && <span className="text-blue">En cours</span>}
                {t.priority === "haute" && <span className="font-semibold text-gold">Haute</span>}
                {due && (
                  <span className={`inline-flex items-center gap-1 ${due.late ? "text-danger" : due.soon ? "text-gold" : ""}`}>
                    <CalendarDays size={13} />
                    {due.label}
                  </span>
                )}
                <PersonBadge person={t.assignee} />
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
