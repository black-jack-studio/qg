import "server-only";
import type { BoardApp } from "@/components/task-board";
import { listApps } from "./queries";

/** Apps dans l'ordre du rail, puis « Général » (appId null : ce qui n'est rattaché à aucune app). */
export async function boardApps(): Promise<BoardApp[]> {
  const { apps } = await listApps();
  return [
    ...apps.map((a) => ({ id: a.id, name: a.name, emoji: a.emoji, color: a.color })),
    { id: null, name: "Général", emoji: "🗂️", color: "gold" },
  ];
}
