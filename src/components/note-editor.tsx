"use client";

import { ChevronLeft, Pin, PinOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { deleteNote, saveNote } from "@/app/actions";
import type { Note } from "@/db/schema";
import { ConfirmButton } from "./confirm-button";
import type { BoardApp } from "./task-board";

export function NoteEditor({ note, apps }: { note: Note; apps: BoardApp[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const isFresh = !note.title && !note.body;
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [editing, setEditing] = useState(isFresh);

  const save = (patch: { title?: string; body?: string }) => start(() => saveNote(note.id, patch));
  const updated = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(
    new Date(note.updatedAt),
  );

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[760px] flex-col px-4 pt-6 pb-12 sm:px-8 md:pt-10">
      <div className="mb-5 flex items-center justify-between gap-2">
        <Link href="/notes" className="btn btn-ghost btn-sm -ml-2.5">
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
        onBlur={() => title !== note.title && save({ title })}
        placeholder="Titre"
        aria-label="Titre de la note"
        autoFocus={isFresh}
        className="plain-text w-full bg-transparent text-[26px] font-extrabold tracking-[-0.01em] outline-none placeholder:text-faint"
      />
      <p className="mt-1 mb-6 text-[12.5px] text-muted">Modifiée le {updated}</p>

      {editing ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => {
            if (body !== note.body) save({ body });
            setEditing(false);
          }}
          autoFocus={!isFresh}
          placeholder="Écris en markdown : # titres, - listes, **gras**, [liens](https://…)"
          aria-label="Contenu de la note"
          className="plain-text min-h-[55vh] w-full flex-1 resize-none bg-transparent text-[15px] leading-relaxed outline-none placeholder:text-faint"
        />
      ) : (
        <button type="button" className="min-h-[55vh] w-full flex-1 cursor-text text-left" onClick={() => setEditing(true)}>
          {body ? (
            <div className="prose-qg text-[15px]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </div>
          ) : (
            <span className="text-[14px] text-faint">Note vide, clique pour écrire.</span>
          )}
        </button>
      )}
    </div>
  );
}
