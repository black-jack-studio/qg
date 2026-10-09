"use client";

import { FileText, Pin, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { createNote } from "@/app/actions";
import type { Note } from "@/db/schema";
import { AppSwatch } from "./badges";
import type { BoardApp } from "./task-board";

function firstLine(body: string): string {
  const line = body.split("\n").find((l) => l.trim().length > 0) ?? "";
  return line
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*+]\s*(\[[ xX]\]\s*)?/, "")
    .slice(0, 160);
}

export function NotesList({ notes, apps }: { notes: Note[]; apps: BoardApp[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [appFilter, setAppFilter] = useState<string>("toutes");
  const appById = useMemo(() => new Map(apps.map((a) => [a.id, a])), [apps]);

  const visible = notes.filter((n) => appFilter === "toutes" || String(n.appId ?? "commun") === appFilter);

  function add() {
    start(async () => {
      const appId = appFilter === "toutes" || appFilter === "commun" ? null : Number(appFilter);
      const id = await createNote(appId);
      router.push(`/notes/${id}`);
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <select
          className="field field-sm w-auto"
          aria-label="Filtrer par app"
          value={appFilter}
          onChange={(e) => setAppFilter(e.target.value)}
        >
          <option value="toutes">Toutes les apps</option>
          {apps.map((a) => (
            <option key={a.id ?? "commun"} value={a.id ?? "commun"}>
              {a.name}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-primary btn-sm" disabled={pending} onClick={add}>
          <Plus size={14} />
          Nouvelle note
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="tile grid place-items-center gap-1 px-6 py-14 text-center">
          <FileText size={20} className="mb-2 text-muted" />
          <p className="text-[15px] font-semibold">Pas encore de note.</p>
          <p className="text-[13px] text-muted">Idées, décisions, process de release… clique « Nouvelle note » pour commencer.</p>
        </div>
      ) : (
        <ul className="tile divide-y divide-hair-soft">
          {visible.map((n) => {
            const app = appById.get(n.appId);
            const preview = firstLine(n.body);
            const updated = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(n.updatedAt));
            return (
              <li key={n.id}>
                <Link href={`/notes/${n.id}`} className="flex min-h-14 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/[0.03]">
                  {n.pinned && <Pin size={13} className="shrink-0 text-gold" aria-label="Épinglée" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14.5px] font-semibold">{n.title || "Sans titre"}</p>
                    {preview && <p className="truncate text-[12.5px] text-muted">{preview}</p>}
                  </div>
                  {app && <AppSwatch emoji={app.emoji} color={app.color} size={18} />}
                  <span className="shrink-0 text-[11.5px] text-muted">{updated}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
