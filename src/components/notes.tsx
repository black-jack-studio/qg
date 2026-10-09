"use client";

import { FileText, Link2, Pin, PinOff, Plus } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createLink, createNote, deleteLink, deleteNote, saveNote } from "@/app/actions";
import type { Link, Note } from "@/db/schema";
import { ConfirmButton } from "./confirm-button";

export function NotesAndLinks({ notes, links, appId }: { notes: Note[]; links: Link[]; appId: number | null }) {
  const [pending, start] = useTransition();
  const [fresh, setFresh] = useState<number | null>(null);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-[13px] font-bold">
            Notes <span className="font-medium text-muted tabular-nums">{notes.length}</span>
          </h2>
          <button
            type="button"
            className="btn btn-sm"
            disabled={pending}
            onClick={() => start(async () => setFresh(await createNote(appId)))}
          >
            <Plus size={14} />
            Nouvelle note
          </button>
        </div>
        {notes.length === 0 ? (
          <div className="tile grid place-items-center gap-1 px-6 py-12 text-center">
            <FileText size={20} className="mb-2 text-muted" />
            <p className="text-[15px] font-semibold">Pas encore de note.</p>
            <p className="text-[13px] text-muted">Décisions, idées, process de release… Le markdown est pris en charge.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((n) => (
              <NoteCard key={n.id} note={n} startEditing={n.id === fresh} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 px-1 text-[13px] font-bold">
          Liens <span className="font-medium text-muted tabular-nums">{links.length}</span>
        </h2>
        <LinkForm appId={appId} />
        {links.length > 0 && (
          <ul className="tile mt-2 divide-y divide-hair-soft">
            {links.map((l) => (
              <li key={l.id} className="group flex items-center gap-2 py-1 pr-1 pl-3">
                <Link2 size={14} className="shrink-0 text-muted" />
                <a href={l.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 py-2 hover:underline hover:underline-offset-4">
                  <span className="block truncate text-[13.5px] font-semibold">{l.label}</span>
                  <span className="block truncate text-[11.5px] text-muted">{l.url.replace(/^https?:\/\//, "")}</span>
                </a>
                <span className="opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                  <ConfirmButton compact label="Supprimer le lien" onConfirm={() => deleteLink(l.id)} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function LinkForm({ appId }: { appId: number | null }) {
  const form = useRef<HTMLFormElement>(null);
  return (
    <form ref={form} action={createLink} className="tile flex flex-col gap-2 p-2">
      <input type="hidden" name="appId" value={appId ?? ""} />
      <input name="url" required className="field field-sm" placeholder="URL (repo, prod, Figma, TestFlight…)" aria-label="URL" autoComplete="off" />
      <div className="flex gap-2">
        <input name="label" className="field field-sm" placeholder="Nom (optionnel)" aria-label="Nom du lien" autoComplete="off" />
        <button type="submit" className="btn btn-sm shrink-0">
          Ajouter
        </button>
      </div>
    </form>
  );
}

function NoteCard({ note, startEditing }: { note: Note; startEditing: boolean }) {
  const [editing, setEditing] = useState(startEditing || (!note.title && !note.body));
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [, start] = useTransition();
  const dirty = title !== note.title || body !== note.body;

  const save = () => dirty && start(() => saveNote(note.id, { title, body }));
  const updated = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(note.updatedAt));

  return (
    <article className="tile">
      <header className="flex items-center gap-2 px-4 pt-3">
        {editing ? (
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={save}
            placeholder="Titre"
            aria-label="Titre de la note"
            autoFocus={startEditing}
            className="plain-text min-w-0 flex-1 bg-transparent text-[16px] font-bold outline-none placeholder:text-faint"
          />
        ) : (
          <h3 className="min-w-0 flex-1 truncate text-[16px] font-bold">{note.title || "Sans titre"}</h3>
        )}
        {note.pinned && !editing && <Pin size={13} className="shrink-0 text-gold" aria-label="Épinglée" />}
        <span className="shrink-0 text-[11.5px] text-muted">{updated}</span>
      </header>

      {editing ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={save}
          rows={Math.min(24, Math.max(6, body.split("\n").length + 1))}
          placeholder="Écris en markdown : # titres, - listes, **gras**, [liens](https://…)"
          aria-label="Contenu de la note"
          className="plain-text block w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed outline-none placeholder:text-faint"
        />
      ) : (
        <button type="button" className="block w-full cursor-text px-4 py-3 text-left" onClick={() => setEditing(true)}>
          {note.body ? (
            <div className="prose-qg">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.body}</ReactMarkdown>
            </div>
          ) : (
            <span className="text-[13px] text-faint">Note vide, clique pour écrire.</span>
          )}
        </button>
      )}

      <footer className="flex items-center gap-1 border-t border-hair-soft px-2 py-1.5">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            if (editing) save();
            setEditing((v) => !v);
          }}
        >
          {editing ? "Terminer" : "Modifier"}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => start(() => saveNote(note.id, { pinned: !note.pinned }))}
        >
          {note.pinned ? <PinOff size={13} /> : <Pin size={13} />}
          {note.pinned ? "Désépingler" : "Épingler"}
        </button>
        <span className="ml-auto">
          <ConfirmButton onConfirm={() => deleteNote(note.id)} />
        </span>
      </footer>
    </article>
  );
}
