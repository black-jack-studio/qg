"use client";

import { Eye, EyeOff, ExternalLink, KeyRound, Pencil, Plus, Search, X } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { deleteCredential, saveCredential } from "@/app/actions";
import type { Credential } from "@/db/schema";
import { AppSwatch } from "./badges";
import type { BoardApp } from "./task-board";
import { ConfirmButton } from "./confirm-button";
import { CopyButton } from "./copy-button";

function host(url: string) {
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function Vault({
  credentials,
  apps,
  scope,
}: {
  credentials: Credential[];
  apps: BoardApp[];
  scope: number | null | "all";
}) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = q
    ? credentials.filter((c) => [c.service, c.username, c.url, c.notes].some((f) => f.toLowerCase().includes(q)))
    : credentials;

  const groups =
    scope === "all"
      ? apps
          .map((app) => ({ app, items: filtered.filter((c) => c.appId === app.id) }))
          .filter((g) => g.items.length > 0)
      : [{ app: null, items: filtered }];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
          <input
            className="field pl-9"
            placeholder="Chercher un accès…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Chercher"
          />
        </label>
        {!adding && (
          <button type="button" className="btn btn-primary ml-auto" onClick={() => setAdding(true)}>
            <Plus size={15} strokeWidth={2.6} />
            Ajouter un accès
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-6 max-w-2xl">
          <CredentialForm apps={apps} scope={scope} onDone={() => setAdding(false)} />
        </div>
      )}

      {credentials.length === 0 && !adding ? (
        <div className="tile grid place-items-center gap-1 px-6 py-14 text-center">
          <KeyRound size={20} className="mb-2 text-muted" />
          <p className="text-[15px] font-semibold">Aucun accès enregistré.</p>
          <p className="text-[13px] text-muted">Identifiants, mots de passe, codes de secours : tout ce qui traîne sur Notion vient ici.</p>
        </div>
      ) : filtered.length === 0 && q ? (
        <p className="py-10 text-center text-[13px] text-muted">Aucun accès ne correspond à « {query} ».</p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(({ app, items }) => (
            <section key={app?.id ?? "scope"}>
              {app && (
                <h2 className="mb-2.5 flex items-center gap-2 px-1 text-[13px] font-bold">
                  <AppSwatch emoji={app.emoji} color={app.color} size={20} />
                  {app.name}
                  <span className="font-medium text-muted tabular-nums">{items.length}</span>
                </h2>
              )}
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((c) => (
                  <CredentialCard key={c.id} credential={c} apps={apps} scope={scope} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function CredentialCard({ credential: c, apps, scope }: { credential: Credential; apps: BoardApp[]; scope: number | null | "all" }) {
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);

  if (editing) return <CredentialForm credential={c} apps={apps} scope={scope} onDone={() => setEditing(false)} />;

  return (
    <div className="flip" data-flipped={revealed}>
      <div className="flip-inner">
        {/* Face cachée */}
        <article className="tile flex min-h-[176px] flex-col p-4" aria-hidden={revealed}>
          <header className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-bold">{c.service}</h3>
              {c.url ? (
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={revealed ? -1 : 0}
                  className="inline-flex max-w-full items-center gap-1 text-[12px] font-medium text-muted hover:text-ink"
                >
                  <span className="truncate">{host(c.url)}</span>
                  <ExternalLink size={11} className="shrink-0" />
                </a>
              ) : (
                <span className="text-[12px] text-faint">Pas d&apos;URL</span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-icon -mt-1 -mr-2"
              aria-label="Modifier"
              title="Modifier"
              tabIndex={revealed ? -1 : 0}
              onClick={() => setEditing(true)}
            >
              <Pencil size={14} />
            </button>
          </header>

          <dl className="mt-3 grid gap-1">
            <Row label="Identifiant" value={c.username} disabled={revealed} />
            <div className="flex items-center gap-2">
              <dt className="w-[86px] shrink-0 text-[12px] font-medium text-muted">Mot de passe</dt>
              <dd className="flex min-w-0 flex-1 items-center gap-1">
                <span className="flex-1 truncate font-mono text-[13px] tracking-[0.2em] text-muted">
                  {c.password ? "•".repeat(Math.min(12, Math.max(8, c.password.length))) : "—"}
                </span>
                {c.password && (
                  <>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      aria-label="Révéler le mot de passe"
                      title="Révéler"
                      tabIndex={revealed ? -1 : 0}
                      onClick={() => setRevealed(true)}
                    >
                      <Eye size={15} />
                    </button>
                    <CopyButton value={c.password} label="Copier le mot de passe" />
                  </>
                )}
              </dd>
            </div>
          </dl>
          {c.notes && <p className="mt-auto line-clamp-2 border-t border-hair-soft pt-2.5 text-[12px] text-muted">{c.notes}</p>}
        </article>

        {/* Face révélée */}
        <article className="flip-back tile flex min-h-[176px] flex-col p-4" aria-hidden={!revealed}>
          <header className="flex items-center justify-between gap-2">
            <h3 className="truncate text-[13px] font-semibold text-muted">{c.service}</h3>
            <button
              type="button"
              className="btn btn-ghost btn-sm -mr-2"
              tabIndex={revealed ? 0 : -1}
              onClick={() => setRevealed(false)}
            >
              <EyeOff size={14} />
              Cacher
            </button>
          </header>
          <div className="flex flex-1 items-center gap-2 py-3">
            <p className="min-w-0 flex-1 font-mono text-[19px] font-medium break-all select-all">{revealed ? c.password : ""}</p>
            {revealed && <CopyButton value={c.password} label="Copier le mot de passe" />}
          </div>
          {c.username && <p className="truncate text-[12px] text-muted">{c.username}</p>}
        </article>
      </div>
    </div>
  );
}

function Row({ label, value, disabled }: { label: string; value: string; disabled: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="w-[86px] shrink-0 text-[12px] font-medium text-muted">{label}</dt>
      <dd className="flex min-w-0 flex-1 items-center gap-1">
        <span className={`flex-1 truncate text-[13px] font-medium ${value ? "" : "text-faint"}`}>{value || "—"}</span>
        {value && !disabled && <CopyButton value={value} label={`Copier ${label.toLowerCase()}`} />}
      </dd>
    </div>
  );
}

function CredentialForm({
  credential,
  apps,
  scope,
  onDone,
}: {
  credential?: Credential;
  apps: BoardApp[];
  scope: number | null | "all";
  onDone: () => void;
}) {
  const [show, setShow] = useState(!credential);
  const [pending, start] = useTransition();
  const uid = useId();
  const appId = credential ? credential.appId : scope === "all" ? apps.find((a) => a.id !== null)?.id ?? null : scope;

  return (
    <form
      className="tile rise grid gap-3 p-4"
      action={(form) =>
        start(async () => {
          await saveCredential(credential?.id ?? null, form);
          onDone();
        })
      }
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{credential ? `Modifier ${credential.service}` : "Nouvel accès"}</h3>
        <button type="button" className="btn btn-ghost btn-icon -mr-2" aria-label="Annuler" onClick={onDone}>
          <X size={15} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Service" name="service" required defaultValue={credential?.service} placeholder="App Store Connect" autoFocus />
        <Field label="URL" name="url" defaultValue={credential?.url} placeholder="appstoreconnect.apple.com" />
        <Field label="Identifiant" name="username" defaultValue={credential?.username} placeholder="email ou nom d'utilisateur" autoComplete="off" />
        <div>
          <label className="label" htmlFor={`${uid}-pw`}>
            Mot de passe
          </label>
          <div className="relative">
            <input
              id={`${uid}-pw`}
              name="password"
              type={show ? "text" : "password"}
              className="field pr-10 font-mono"
              defaultValue={credential?.password}
              autoComplete="new-password"
              data-1p-ignore
            />
            <button
              type="button"
              className="btn btn-ghost btn-icon absolute top-1/2 right-1 size-8 -translate-y-1/2"
              aria-label={show ? "Masquer" : "Afficher"}
              onClick={() => setShow((v) => !v)}
            >
              {show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </div>
      <div>
        <label className="label" htmlFor={`${uid}-notes`}>
          Notes
        </label>
        <textarea id={`${uid}-notes`} name="notes" rows={2} className="field" defaultValue={credential?.notes} placeholder="2FA sur le téléphone de Stan, codes de secours…" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select name="appId" className="field field-sm w-auto" defaultValue={appId ?? ""} aria-label="App">
          {apps.map((a) => (
            <option key={a.id ?? "commun"} value={a.id ?? ""}>
              {a.name}
            </option>
          ))}
        </select>
        {credential && <ConfirmButton onConfirm={() => deleteCredential(credential.id)} />}
        <div className="ml-auto flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={onDone}>
            Annuler
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </div>
    </form>
  );
}

export function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      <input id={id} name={name} className="field" {...props} />
    </div>
  );
}
