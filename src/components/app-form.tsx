"use client";

import { useId, useState } from "react";
import { useFormStatus } from "react-dom";
import type { App } from "@/db/schema";
import { APP_COLORS, APP_STATUSES } from "@/lib/meta";

const EMOJIS = ["📱", "🃏", "🎮", "🧠", "💬", "📸", "🎧", "🛒", "📊", "🧩", "🚀", "🌱", "🍉", "🍸", "🍒", "🔥"];
const PLATFORMS = [
  ["ios", "iOS"],
  ["android", "Android"],
  ["web", "Web"],
  ["mac", "macOS"],
] as const;

export function AppForm({ app, action, children }: { app?: App; action: (form: FormData) => Promise<void>; children?: React.ReactNode }) {
  const id = useId();
  const [emoji, setEmoji] = useState(app?.emoji ?? "📱");
  const [color, setColor] = useState(app?.color ?? "blue");
  const platforms = new Set((app?.platforms ?? "").split(",").filter(Boolean));

  return (
    <form action={action} className="grid max-w-2xl gap-6">
      <div className="flex items-center gap-5">
        <div className="relative grid size-[96px] shrink-0 place-items-center overflow-hidden rounded-[12px] bg-card text-[50px] leading-none">
          <span aria-hidden="true">{emoji}</span>
          <span className="absolute inset-x-0 bottom-0 h-[3px]" style={{ background: APP_COLORS[color as keyof typeof APP_COLORS] }} />
        </div>
        <div className="min-w-0 flex-1">
          <label className="label" htmlFor={`${id}-name`}>
            Nom de l&apos;app
          </label>
          <input id={`${id}-name`} name="name" required maxLength={80} className="field h-11 text-[16px] font-semibold" defaultValue={app?.name} placeholder="FaceUp Pairs" autoFocus={!app} />
        </div>
      </div>

      <fieldset>
        <legend className="label">Emoji</legend>
        <div className="flex flex-wrap items-center gap-1.5">
          {EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              aria-pressed={emoji === e}
              aria-label={`Emoji ${e}`}
              className={`grid size-10 place-items-center rounded-[10px] bg-card text-[20px] transition-[outline-color] ${
                emoji === e ? "outline-2 outline-accent" : "outline-2 outline-transparent hover:outline-hair"
              }`}
            >
              {e}
            </button>
          ))}
          <input
            name="emoji"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={8}
            aria-label="Autre emoji"
            className="field ml-1 w-20 text-center text-[18px]"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Couleur du badge</legend>
        <div className="flex gap-2">
          {Object.entries(APP_COLORS).map(([key, hex]) => (
            <label key={key} className="cursor-pointer">
              <input type="radio" name="color" value={key} checked={color === key} onChange={() => setColor(key)} className="peer sr-only" />
              <span
                className="block size-9 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-board transition-shadow peer-checked:ring-ink peer-focus-visible:ring-accent"
                style={{ background: hex }}
              />
              <span className="sr-only">{key}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor={`${id}-status`}>
            Statut
          </label>
          <select id={`${id}-status`} name="status" className="field" defaultValue={app?.status ?? "dev"}>
            {Object.entries(APP_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <fieldset>
          <legend className="label">Plateformes</legend>
          <div className="flex flex-wrap gap-1.5">
            {PLATFORMS.map(([key, label]) => (
              <label key={key} className="cursor-pointer">
                <input type="checkbox" name="platforms" value={key} defaultChecked={platforms.has(key)} className="peer sr-only" />
                <span className="btn btn-sm peer-checked:border-accent peer-checked:bg-accent/15 peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <label className="label" htmlFor={`${id}-desc`}>
          Description
        </label>
        <textarea id={`${id}-desc`} name="description" rows={2} maxLength={400} className="field" defaultValue={app?.description} placeholder="Jeu de memory 4×4, sortie iOS prévue en novembre." />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {children}
        <Submit label={app ? "Enregistrer" : "Créer l'app"} />
      </div>
    </form>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-primary ml-auto h-10 px-5" disabled={pending}>
      {pending ? "Enregistrement…" : label}
    </button>
  );
}
