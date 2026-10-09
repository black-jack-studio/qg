import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NoteEditor } from "@/components/note-editor";
import { boardApps } from "@/lib/board-apps";
import { getNote } from "@/lib/queries";

export async function generateMetadata({ params }: PageProps<"/notes/[id]">): Promise<Metadata> {
  const { id } = await params;
  const note = /^\d+$/.test(id) ? await getNote(Number(id)) : null;
  return { title: note?.title || "Note" };
}

export default async function NoteDetailPage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [note, apps] = await Promise.all([getNote(Number(id)), boardApps()]);
  if (!note) notFound();

  return <NoteEditor note={note} apps={apps} />;
}
