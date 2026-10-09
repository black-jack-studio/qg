"use client";

import { FileText, Link2, Pin, PinOff, Plus } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { createLink, createNote, deleteLink, deleteNote, saveNote } from "@/app/actions";
import type { Link, Note } from "@/db/schema";
import type { BoardApp } from "./task-board";
import { AppSwatch } from "./badges";
import { ConfirmButton } from "./confirm-button";

export function NotesAndLinks({
  notes,
  links,
  appId,
  apps,
  scope = appId,
}: {
  notes: Note[];
  links: Link[];
  appId: number | null;
  apps?: BoardApp[];
  /** id d'app, null pour « Général », "all" pour la vue transversale (Notion-like). */
  scope?: number | null | "all";
}) {
  const [pending, start] = useTransition();
  const [fresh, setFresh] = useState<number | null>(null);
  const showApp = scope === "all";
  const [newAppId, setNewAppId] = useState<string>(apps?.find((a) => a.id !== null)?.id?.toString() ?? "");

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <h2 className="text-[13px] font-bold">
            Notes <span className="font-medium text-muted tabular-nums">{notes.length}</span>
          </h2>
          <div className="flex items-center gap-2">
            {showApp && apps && (
              <select
                className="field field-sm w-auto"
                aria-label="App de la nouvelle note"
                value={newAppId}
                onChange={(e) => setNewAppId(e.target.value)}
              >
                {apps.map((a) => (
                  <option key={a.id ?? "commun"} value={a.id ?? ""}>
                    {a.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              className="btn btn-sm"
              disabled={pending}
              onClick={() =>
                start(async () => setFresh(await createNote(showApp ? (newAppId ? Number(newAppId) : null) : appId)))
              }
            >
              <Plus size={14} />
              Nouvelle note
            </button>
          </div>
        </div>
        {notes.length === 0 ? (
          <div className="tile grid place-items-center gap-1 px-6 py-12 text-center">
            <FileText size={20} className="mb-2 text-muted" />
            <p className="text-[15px] font-semibold">Pas encore de note.</p>
            <p className="text-[13px] text-muted">
              Idées, décisions, process de release… Markdown pris en charge, dont les cases à cocher (
              <code>- [ ] à faire</code>).
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((n) => (
              <NoteCard
                key={n.id}
                note={n}
                startEditing={n.id === fresh}
                showApp={showApp}
                apps={apps}
              />
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

/** Bascule la case à cocher (`- [ ]` / `- [x]`) à la ligne donnée (1-indexée, comme les positions remark) d'un texte markdown. */
function toggleCheckboxAtLine(body: string, line: number): string {
  const lines = body.split("\n");
  const raw = lines[line - 1];
  if (raw === undefined) return body;
  const m = raw.match(/^(\s*[-*+]\s+)\[([ xX])\](\s.*)?$/);
  if (!m) return body;
  const checked = m[2].toLowerCase() === "x";
  lines[line - 1] = `${m[1]}[${checked ? " " : "x"}]${m[3] ?? ""}`;
  return lines.join("\n");
}

function NoteCard({
  note,
  startEditing,
  showApp = false,
  apps,
}: {
  note: Note;
  startEditing: boolean;
  showApp?: boolean;
  apps?: BoardApp[];
}) {
  const [editing, setEditing] = useState(startEditing || (!note.title && !note.body));
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [, start] = useTransition();
  const dirty = title !== note.title || body !== note.body;

  const save = () => dirty && start(() => saveNote(note.id, { title, body }));
  const updated = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(note.updatedAt));
  const app = showApp && apps ? apps.find((a) => a.id === note.appId) : undefined;

  const toggleCheck = (line: number) => {
    const next = toggleCheckboxAtLine(body, line);
    if (next === body) return;
    setBody(next);
    start(() => saveNote(note.id, { body: next }));
  };

  // Identifie chaque case par la ligne source du listItem (remark la préserve sur le `input` synthétisé par le GFM),
  // plutôt qu'un compteur incrémenté pendant le rendu : plus fiable face aux doubles rendus de React.
  const components: Components = {
    input: (props) => {
      if (props.type !== "checkbox") return <input {...props} />;
      const node = props.node as { position?: { start?: { line?: number } } } | undefined;
      const line = node?.position?.start?.line;
      return (
        <input
          type="checkbox"
          checked={!!props.checked}
          readOnly
          onClick={(e) => {
            e.stopPropagation();
            if (line) toggleCheck(line);
          }}
          className="cursor-pointer"
        />
      );
    },
  };

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
            className="min-w-0 flex-1 bg-transparent text-[16px] font-bold outline-none placeholder:text-faint"
          />
        ) : (
          <h3 className="min-w-0 flex-1 truncate text-[16px] font-bold">{note.title || "Sans titre"}</h3>
        )}
        {app && <AppSwatch emoji={app.emoji} color={app.color} size={18} />}
        {note.pinned && !editing && <Pin size={13} className="shrink-0 text-gold" aria-label="Épinglée" />}
        <span className="shrink-0 text-[11.5px] text-muted">{updated}</span>
      </header>

      {editing ? (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={save}
          rows={Math.min(24, Math.max(6, body.split("\n").length + 1))}
          placeholder="Écris en markdown : # titres, - listes, **gras**, - [ ] case à cocher, [liens](https://…)"
          aria-label="Contenu de la note"
          className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-[13px] leading-relaxed outline-none placeholder:text-faint"
        />
      ) : (
        // Pas un <button> : le markdown rendu peut contenir des cases à cocher, interactives elles-mêmes.
        <div
          role="button"
          tabIndex={0}
          className="block w-full cursor-text px-4 py-3 text-left"
          onClick={() => setEditing(true)}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setEditing(true)}
        >
          {note.body ? (
            <div className="prose-qg">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {note.body}
              </ReactMarkdown>
            </div>
          ) : (
            <span className="text-[13px] text-faint">Note vide, clique pour écrire.</span>
          )}
        </div>
      )}

      <footer className="flex flex-wrap items-center gap-1 border-t border-hair-soft px-2 py-1.5">
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
        {showApp && apps && (
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
        )}
        <span className="ml-auto">
          <ConfirmButton onConfirm={() => deleteNote(note.id)} />
        </span>
      </footer>
    </article>
  );
}
