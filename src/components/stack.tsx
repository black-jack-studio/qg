"use client";

import { ExternalLink, Layers, Pencil, Plus, X } from "lucide-react";
import { useId, useState, useTransition } from "react";
import { deleteService, saveService } from "@/app/actions";
import type { Service } from "@/db/schema";
import { PAYERS, SERVICE_CATEGORIES, formatEuros } from "@/lib/meta";
import { AppSwatch, PersonBadge } from "./badges";
import { ConfirmButton } from "./confirm-button";
import type { BoardApp } from "./task-board";
import { Field } from "./vault";

type PayerFilter = "tous" | keyof typeof PAYERS;
const sum = (list: Service[]) => list.reduce((n, s) => n + s.monthlyCostCents, 0);

export function Stack({ services: all, apps, scope }: { services: Service[]; apps: BoardApp[]; scope: number | null | "all" }) {
  const [adding, setAdding] = useState(false);
  const [payer, setPayer] = useState<PayerFilter>("tous");
  const services = payer === "tous" ? all : all.filter((s) => s.payer === payer);
  const total = sum(services);

  const groups =
    scope === "all"
      ? apps.map((app) => ({ app, items: services.filter((s) => s.appId === app.id) })).filter((g) => g.items.length > 0)
      : [{ app: null, items: services }];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <p className="text-[15px] font-semibold tabular-nums">
          {formatEuros(total)}
          <span className="text-muted">/mois · </span>
          {formatEuros(total * 12)}
          <span className="text-muted">/an · </span>
          {services.length}
          <span className="text-muted"> {services.length > 1 ? "services" : "service"}</span>
        </p>
        {!adding && (
          <button type="button" className="btn btn-primary ml-auto" onClick={() => setAdding(true)}>
            <Plus size={15} strokeWidth={2.6} />
            Ajouter un service
          </button>
        )}
      </div>

      {all.length > 0 && (
        <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex rounded-[12px] bg-card p-0.5 ring-1 ring-hair-soft" role="radiogroup" aria-label="Payé par">
            {(["tous", ...Object.keys(PAYERS)] as PayerFilter[]).map((key) => {
              const active = payer === key;
              const amount = sum(key === "tous" ? all : all.filter((s) => s.payer === key));
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setPayer(key)}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-[10px] px-3 text-[12.5px] font-semibold whitespace-nowrap transition-colors duration-150 ${
                    active ? "bg-ink text-black" : "text-muted hover:text-ink"
                  }`}
                >
                  {key === "tous" ? "Tout" : PAYERS[key]}
                  <span className={`tabular-nums ${active ? "text-black/55" : "text-faint"}`}>{formatEuros(amount)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {adding && (
        <div className="mb-6 max-w-3xl">
          <ServiceForm apps={apps} scope={scope} onDone={() => setAdding(false)} />
        </div>
      )}

      {all.length > 0 && services.length === 0 ? (
        <p className="tile px-4 py-8 text-center text-[13px] text-muted">
          Aucun abonnement payé par {payer === "commun" ? "le commun" : PAYERS[payer as keyof typeof PAYERS]}.
        </p>
      ) : services.length === 0 && !adding ? (
        <div className="tile grid place-items-center gap-1 px-6 py-14 text-center">
          <Layers size={20} className="mb-2 text-muted" />
          <p className="text-[15px] font-semibold">Aucun service pour l&apos;instant.</p>
          <p className="text-[13px] text-muted">Vercel, Supabase, App Store, RevenueCat… Note le plan et le prix pour suivre ce que ça coûte.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(({ app, items }) => (
            <section key={app?.id ?? "scope"}>
              {app && (
                <h2 className="mb-2.5 flex items-center gap-2 px-1 text-[13px] font-bold">
                  <AppSwatch emoji={app.emoji} color={app.color} size={20} />
                  {app.name}
                  <span className="ml-auto font-semibold text-muted tabular-nums">
                    {formatEuros(sum(items))}/mois
                  </span>
                </h2>
              )}
              <ul className="tile divide-y divide-hair-soft">
                {items.map((s) => (
                  <ServiceRow key={s.id} service={s} apps={apps} scope={scope} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function ServiceRow({ service: s, apps, scope }: { service: Service; apps: BoardApp[]; scope: number | null | "all" }) {
  const [editing, setEditing] = useState(false);
  if (editing)
    return (
      <li>
        <ServiceForm service={s} apps={apps} scope={scope} onDone={() => setEditing(false)} />
      </li>
    );

  return (
    <li className="group flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:flex-nowrap">
      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-bold">{s.name}</span>
          <span className="shrink-0 rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-semibold text-muted">
            {SERVICE_CATEGORIES[s.category as keyof typeof SERVICE_CATEGORIES] ?? s.category}
          </span>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-muted">
          {[s.plan, s.account, s.notes].filter(Boolean).join(" · ") || "Aucun détail"}
        </p>
      </div>
      <span className="text-[14px] font-semibold tabular-nums">
        {s.monthlyCostCents ? `${formatEuros(s.monthlyCostCents)}/mois` : <span className="text-muted">Gratuit</span>}
      </span>
      <span className="inline-flex w-[84px] items-center gap-1.5 text-[12px] font-semibold text-muted" title="Payé par">
        {s.payer === "commun" ? (
          <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px]">Commun</span>
        ) : (
          <>
            <PersonBadge person={s.payer} />
            {PAYERS[s.payer as keyof typeof PAYERS] ?? s.payer}
          </>
        )}
      </span>
      <div className="ml-auto flex items-center">
        {s.url && (
          <a href={s.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-icon" aria-label={`Ouvrir ${s.name}`} title="Ouvrir">
            <ExternalLink size={14} />
          </a>
        )}
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Modifier" title="Modifier" onClick={() => setEditing(true)}>
          <Pencil size={14} />
        </button>
      </div>
    </li>
  );
}

function ServiceForm({
  service,
  apps,
  scope,
  onDone,
}: {
  service?: Service;
  apps: BoardApp[];
  scope: number | null | "all";
  onDone: () => void;
}) {
  const [pending, start] = useTransition();
  const id = useId();
  const appId = service ? service.appId : scope === "all" ? apps.find((a) => a.id !== null)?.id ?? null : scope;

  return (
    <form
      className="tile rise grid gap-3 p-4"
      action={(form) =>
        start(async () => {
          await saveService(service?.id ?? null, form);
          onDone();
        })
      }
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold">{service ? `Modifier ${service.name}` : "Nouveau service"}</h3>
        <button type="button" className="btn btn-ghost btn-icon -mr-2" aria-label="Annuler" onClick={onDone}>
          <X size={15} />
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Nom" name="name" required defaultValue={service?.name} placeholder="Supabase" autoFocus />
        <div>
          <label className="label" htmlFor={`${id}-cat`}>
            Catégorie
          </label>
          <select id={`${id}-cat`} name="category" className="field" defaultValue={service?.category ?? "hebergement"}>
            {Object.entries(SERVICE_CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <Field
          label="Coût mensuel (€)"
          name="cost"
          inputMode="decimal"
          defaultValue={service?.monthlyCostCents ? String(service.monthlyCostCents / 100).replace(".", ",") : ""}
          placeholder="0"
        />
        <Field label="Plan" name="plan" defaultValue={service?.plan} placeholder="Pro" />
        <Field label="Compte" name="account" defaultValue={service?.account} placeholder="stan@…" />
        <Field label="URL" name="url" defaultValue={service?.url} placeholder="supabase.com/dashboard" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <fieldset>
          <legend className="label">Payé par</legend>
          <div className="inline-flex rounded-[12px] bg-card p-0.5 ring-1 ring-hair">
            {Object.entries(PAYERS).map(([key, label]) => (
              <label key={key} className="cursor-pointer">
                <input type="radio" name="payer" value={key} defaultChecked={(service?.payer ?? "commun") === key} className="peer sr-only" />
                <span className="inline-flex h-8 items-center rounded-[10px] px-3.5 text-[13px] font-semibold text-muted transition-colors duration-150 peer-checked:bg-ink peer-checked:text-black peer-focus-visible:outline-2 peer-focus-visible:outline-accent hover:text-ink">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label className="label" htmlFor={`${id}-app`}>
            App
          </label>
          <select id={`${id}-app`} name="appId" className="field" defaultValue={appId ?? ""}>
            {apps.map((a) => (
              <option key={a.id ?? "commun"} value={a.id ?? ""}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Field label="Notes" name="notes" defaultValue={service?.notes} placeholder="Projet eu-west, renouvellement en mars…" />
      <div className="flex flex-wrap items-center gap-2">
        {service && <ConfirmButton onConfirm={() => deleteService(service.id)} />}
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
