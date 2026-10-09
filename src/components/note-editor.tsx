"use client";

import { ChevronLeft, Pin, PinOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import { deleteNote, saveNote } from "@/app/actions";
import type { Note } from "@/db/schema";
import { ConfirmButton } from "./confirm-button";
import type { BoardApp } from "./task-board";

export function NoteEditor({ note, apps }: { note: Note; apps: BoardApp[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const saved = useRef({ title: note.title, body: note.body });
  const area = useRef<HTMLTextAreaElement>(null);

  const flush = () => {
    if (title === saved.current.title && body === saved.current.body) return;
    saved.current = { title, body };
    start(() => saveNote(note.id, { title, body }));
  };

  // Sauvegarde auto quelques instants après la dernière frappe, comme Notes.
  useEffect(() => {
    if (title === saved.current.title && body === saved.current.body) return;
    const t = setTimeout(() => {
      saved.current = { title, body };
      start(() => saveNote(note.id, { title, body }));
    }, 700);
    return () => clearTimeout(t);
  }, [title, body, note.id]);

  // La zone de texte grandit avec son contenu : la page défile, pas le champ.
  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [body]);

  const updated = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(
    new Date(note.updatedAt),
  );

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pt-6 pb-12 sm:px-8 md:pt-10">
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link href="/notes" onClick={flush} className="btn btn-ghost btn-sm -ml-2.5">
          <ChevronLeft size={16} />
          Notes
        </Link>
        <div className="flex items-center gap-1.5">
          <select
            className="field field-sm w-auto"
            aria-label="Déplacer vers une app"
            value={note.appId ?? ""}
            onChange={(e) => start(() => saveNote(note.id, { appId: e.target.value ? Number(e.target.value) : null }))}
          >
            {apps.map((a) => (
              <option key={a.id ?? "commun"} value={a.id ?? ""}>
                {a.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            aria-label={note.pinned ? "Désépingler" : "Épingler"}
            onClick={() => start(() => saveNote(note.id, { pinned: !note.pinned }))}
          >
            {note.pinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
          <ConfirmButton
            compact
            label="Supprimer la note"
            onConfirm={() => {
              start(() => deleteNote(note.id));
              router.push("/notes");
            }}
          />
        </div>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={flush}
        placeholder="Titre"
        aria-label="Titre de la note"
        autoFocus={!note.title && !note.body}
        className="plain-text w-full bg-transparent text-[26px] font-extrabold tracking-[-0.01em] outline-none placeholder:text-faint"
      />
      <p className="mt-1 mb-4 text-[12.5px] text-muted">Modifiée le {updated}</p>

      <textarea
        ref={area}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onBlur={flush}
        placeholder="Écris ici…"
        aria-label="Contenu de la note"
        className="plain-text block min-h-[60vh] w-full resize-none overflow-hidden rounded-none bg-transparent p-0 text-[15px] leading-relaxed outline-none placeholder:text-faint"
      />
    </div>
  );
}
