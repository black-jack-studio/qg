"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { ArrowDown, ArrowUp, CalendarDays, Check, ChevronDown, Columns3, List, Plus, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import { clearDoneTasks, createTask, deleteTask, moveTask, updateTask, type TaskPatch } from "@/app/actions";
import type { Task } from "@/db/schema";
import { PEOPLE, PRIORITIES, TASK_STATUSES, formatDue, type TaskStatus } from "@/lib/meta";
import { AppSwatch, PersonBadge } from "./badges";
import { ConfirmButton } from "./confirm-button";

export type BoardApp = { id: number | null; name: string; emoji: string; color: string };

type Action =
  | { type: "add"; task: Task }
  | { type: "patch"; id: number; patch: TaskPatch }
  | { type: "move"; id: number; status: string; orderedIds: number[] }
  | { type: "delete"; ids: number[] };

function reduce(tasks: Task[], action: Action): Task[] {
  switch (action.type) {
    case "add":
      return [action.task, ...tasks];
    case "patch":
      return tasks.map((t) => (t.id === action.id ? ({ ...t, ...action.patch } as Task) : t));
    case "delete":
      return tasks.filter((t) => !action.ids.includes(t.id));
    case "move": {
      const rank = new Map(action.orderedIds.map((id, i) => [id, i]));
      return tasks
        .map((t) => (t.id === action.id ? { ...t, status: action.status } : t))
        .map((t) => (rank.has(t.id) ? { ...t, position: rank.get(t.id)! } : t));
    }
  }
}

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.position - b.position || b.id - a.id);
}

const COLUMNS: TaskStatus[] = ["todo", "doing", "done"];

export function TaskBoard({
  tasks,
  apps,
  scope,
}: {
  tasks: Task[];
  apps: BoardApp[];
  /** id d'app, null pour « Général », "all" pour la vue transversale. */
  scope: number | null | "all";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const view = params.get("vue") === "kanban" ? "kanban" : "liste";

  const [items, apply] = useOptimistic(tasks, reduce);
  const [, start] = useTransition();
  const [person, setPerson] = useState<"tous" | "stan" | "anat">("tous");
  const [appFilter, setAppFilter] = useState<string>("toutes");
  const [openId, setOpenId] = useState<number | null>(null);

  const appById = useMemo(() => new Map(apps.map((a) => [a.id, a])), [apps]);
  const visible = sortTasks(
    items.filter(
      (t) =>
        (person === "tous" || t.assignee === person) &&
        (appFilter === "toutes" || String(t.appId ?? "commun") === appFilter),
    ),
  );

  const act = (action: Action, server: () => Promise<unknown>) =>
    start(async () => {
      apply(action);
      await server();
    });

  const api: BoardApi = {
    patch: (id, patch) => act({ type: "patch", id, patch }, () => updateTask(id, patch)),
    remove: (id) => act({ type: "delete", ids: [id] }, () => deleteTask(id)),
    move: (id, status, orderedIds) => act({ type: "move", id, status, orderedIds }, () => moveTask(id, status, orderedIds)),
    toggle: (id) => setOpenId((cur) => (cur === id ? null : id)),
    openId,
    appById,
    showApp: scope === "all",
    apps,
  };

  function setView(next: "liste" | "kanban") {
    const q = new URLSearchParams(params);
    if (next === "kanban") q.set("vue", "kanban");
    else q.delete("vue");
    router.replace(`${pathname}?${q}`, { scroll: false });
  }

  return (
    <div>
      <AddTask
        scope={scope}
        apps={apps}
        onAdd={async (form) => {
          const appId = scope === "all" ? (form.get("appId") ? Number(form.get("appId")) : null) : scope;
          apply({
            type: "add",
            task: {
              id: -Date.now(),
              appId,
              title: String(form.get("title") ?? ""),
              details: "",
              status: "todo",
              priority: String(form.get("priority") || "normale"),
              assignee: (form.get("assignee") as string) || null,
              dueDate: (form.get("dueDate") as string) || null,
              position: -1e9,
              createdAt: new Date(),
              doneAt: null,
            },
          });
          await createTask(form);
        }}
      />

      <div className="mt-5 mb-3 flex flex-wrap items-center gap-2">
        <Segmented
          value={person}
          onChange={setPerson}
          options={[
            ["tous", "Tout le monde"],
            ["stan", "Stan"],
            ["anat", "Anat"],
          ]}
        />
        {scope === "all" && (
          <select
            className="field field-sm w-auto max-sm:order-last max-sm:basis-full"
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            aria-label="Filtrer par app"
          >
            <option value="toutes">Toutes les apps</option>
            {apps.map((a) => (
              <option key={a.id ?? "commun"} value={a.id ?? "commun"}>
                {a.name}
              </option>
            ))}
          </select>
        )}
        <div className="ml-auto">
          <Segmented
            value={view}
            onChange={setView}
            options={[
              ["liste", <IconLabel key="l" icon={<List size={14} />} label="Liste" />],
              ["kanban", <IconLabel key="k" icon={<Columns3 size={14} />} label="Kanban" />],
            ]}
          />
        </div>
      </div>

      {view === "kanban" ? (
        <Kanban tasks={visible} all={items} api={api} />
      ) : (
        <ListView
          tasks={visible}
          api={api}
          onClearDone={(ids) => act({ type: "delete", ids }, () => clearDoneTasks(ids))}
        />
      )}
    </div>
  );
}

type BoardApi = {
  patch: (id: number, patch: TaskPatch) => void;
  remove: (id: number) => void;
  move: (id: number, status: string, orderedIds: number[]) => void;
  toggle: (id: number) => void;
  openId: number | null;
  appById: Map<number | null, BoardApp>;
  showApp: boolean;
  apps: BoardApp[];
};

// ── Ajout ─────────────────────────────────────────────────────────

function AddTask({
  scope,
  apps,
  onAdd,
}: {
  scope: number | null | "all";
  apps: BoardApp[];
  onAdd: (form: FormData) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  return (
    <form
      action={async (form) => {
        await onAdd(form);
        input.current?.focus();
      }}
      className="tile flex flex-col gap-2 p-2 sm:flex-row sm:items-center"
    >
      {scope !== "all" && <input type="hidden" name="appId" value={scope ?? ""} />}
      <div className="flex min-w-0 flex-1 items-center gap-2.5 pl-3">
        <Plus size={16} className="shrink-0 text-muted" />
        <input
          ref={input}
          name="title"
          required
          autoComplete="off"
          placeholder="Ajouter une tâche…"
          onFocus={() => setExpanded(true)}
          className="h-9 min-w-0 flex-1 bg-transparent px-2 text-[14px] font-medium placeholder:text-muted"
        />
      </div>
      <div className={`flex flex-wrap items-center gap-2 ${expanded ? "" : "max-sm:hidden"}`}>
        {scope === "all" && (
          <select name="appId" className="field field-sm w-auto" aria-label="App" defaultValue={apps.find((a) => a.id !== null)?.id ?? ""}>
            {apps.map((a) => (
              <option key={a.id ?? "commun"} value={a.id ?? ""}>
                {a.name}
              </option>
            ))}
          </select>
        )}
        <select name="priority" className="field field-sm w-auto" aria-label="Priorité" defaultValue="normale">
          {Object.entries(PRIORITIES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select name="assignee" className="field field-sm w-auto" aria-label="Qui s'en occupe" defaultValue="">
          <option value="">Personne</option>
          {Object.entries(PEOPLE).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <label className="field field-sm flex w-auto items-center gap-2 text-muted">
          <span className="font-semibold">Échéance</span>
          <input type="date" name="dueDate" className="bg-transparent text-[12px] text-ink outline-none" />
        </label>
        <button type="submit" className="btn btn-primary btn-sm">
          Ajouter
        </button>
      </div>
    </form>
  );
}

// ── Liste ─────────────────────────────────────────────────────────

function ListView({ tasks, api, onClearDone }: { tasks: Task[]; api: BoardApi; onClearDone: (ids: number[]) => void }) {
  const [showDone, setShowDone] = useState(false);
  const groups = COLUMNS.map((status) => ({ status, tasks: tasks.filter((t) => t.status === status) }));
  const open = groups.filter((g) => g.status !== "done");
  const done = groups.find((g) => g.status === "done")!.tasks;

  if (tasks.length === 0) return <EmptyTasks />;

  return (
    <div className="flex flex-col gap-6">
      {open.map(
        (g) =>
          g.tasks.length > 0 && (
            <section key={g.status}>
              <GroupTitle label={TASK_STATUSES[g.status]} count={g.tasks.length} />
              <ul className="tile divide-y divide-hair-soft">
                {g.tasks.map((t) => (
                  <TaskRow key={t.id} task={t} api={api} />
                ))}
              </ul>
            </section>
          ),
      )}
      {done.length > 0 && (
        <section>
          <div className="flex items-center gap-2">
            <button type="button" className="btn btn-ghost btn-sm -ml-2.5" onClick={() => setShowDone((v) => !v)} aria-expanded={showDone}>
              <ChevronDown size={14} className={`transition-transform ${showDone ? "" : "-rotate-90"}`} />
              {done.length} {done.length > 1 ? "terminées" : "terminée"}
            </button>
            {showDone && <ConfirmButton label="Vider les terminées" onConfirm={() => onClearDone(done.map((t) => t.id))} />}
          </div>
          {showDone && (
            <ul className="tile mt-2 divide-y divide-hair-soft">
              {done.map((t) => (
                <TaskRow key={t.id} task={t} api={api} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function TaskRow({ task, api }: { task: Task; api: BoardApi }) {
  const open = api.openId === task.id;
  const done = task.status === "done";
  return (
    <li className={task.id < 0 ? "opacity-60" : ""}>
      <div className="flex min-h-12 items-center gap-3 px-3 py-2">
        <Checkbox checked={done} onChange={() => api.patch(task.id, { status: done ? "todo" : "done" })} />
        <button
          type="button"
          onClick={() => api.toggle(task.id)}
          aria-expanded={open}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        >
          <span className={`min-w-0 flex-1 text-[14px] font-medium ${done ? "text-muted line-through decoration-faint" : ""}`}>
            {task.title}
            {task.details && <span className="ml-2 text-[12px] text-muted">·  note</span>}
          </span>
          <TaskMeta task={task} api={api} />
        </button>
      </div>
      {open && <TaskEditor task={task} api={api} />}
    </li>
  );
}

function TaskMeta({ task, api }: { task: Task; api: BoardApi }) {
  const due = formatDue(task.dueDate);
  const app = api.showApp ? api.appById.get(task.appId) : undefined;
  return (
    <span className="flex shrink-0 items-center gap-2.5 text-[12px] font-medium text-muted">
      {app && (
        <span className="hidden items-center gap-1.5 sm:inline-flex">
          <AppSwatch emoji={app.emoji} color={app.color} size={18} />
          <span className="max-w-[110px] truncate">{app.name}</span>
        </span>
      )}
      {due && task.status !== "done" && (
        <span className={`inline-flex items-center gap-1 ${due.late ? "text-danger" : due.soon ? "text-gold" : ""}`}>
          <CalendarDays size={13} />
          {due.label}
        </span>
      )}
      <PriorityMark priority={task.priority} />
      <PersonBadge person={task.assignee} />
    </span>
  );
}

function PriorityMark({ priority }: { priority: string }) {
  if (priority === "haute")
    return (
      <span className="inline-flex items-center gap-0.5 font-semibold text-gold" title="Priorité haute">
        <ArrowUp size={13} strokeWidth={2.6} />
        Haute
      </span>
    );
  if (priority === "basse")
    return (
      <span className="inline-flex items-center text-faint" title="Priorité basse" aria-label="Priorité basse">
        <ArrowDown size={13} strokeWidth={2.6} />
      </span>
    );
  return null;
}

// ── Kanban ────────────────────────────────────────────────────────

function Kanban({ tasks, all, api }: { tasks: Task[]; all: Task[]; api: BoardApi }) {
  const [dragging, setDragging] = useState<Task | null>(null);
  // id stable entre serveur et client, sinon les attributs aria de dnd-kit ne s'hydratent pas.
  const dndId = useId();
  const justDragged = useRef(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor),
  );

  function onStart(e: DragStartEvent) {
    justDragged.current = true;
    setDragging(all.find((t) => t.id === e.active.id) ?? null);
  }

  function onEnd(e: DragEndEvent) {
    setDragging(null);
    // Le clic qui suit un lâcher ne doit pas ouvrir l'éditeur.
    setTimeout(() => (justDragged.current = false), 0);
    const id = Number(e.active.id);
    const over = e.over?.id;
    if (over === undefined) return;
    let status: string;
    let beforeId: number | null = null;
    if (String(over).startsWith("col-")) {
      status = String(over).slice(4);
    } else {
      const target = all.find((t) => t.id === Number(String(over).slice(5)));
      if (!target || target.id === id) return;
      status = target.status;
      beforeId = target.id;
    }
    // L'ordre se calcule sur toute la colonne, y compris les tâches masquées par un filtre.
    const column = sortTasks(all.filter((t) => t.status === status && t.id !== id)).map((t) => t.id);
    const at = beforeId === null ? column.length : column.indexOf(beforeId);
    column.splice(at, 0, id);
    api.move(id, status, column);
  }

  return (
    <DndContext id={dndId} sensors={sensors} onDragStart={onStart} onDragEnd={onEnd} onDragCancel={() => { setDragging(null); justDragged.current = false; }}>
      <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {COLUMNS.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((t) => t.status === status)}
            api={{ ...api, toggle: (id) => !justDragged.current && api.toggle(id) }}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }}>
        {dragging && (
          <div className="rotate-[1.5deg] rounded-[12px] shadow-[0_18px_40px_rgb(0_0_0/0.55)]">
            <CardBody task={dragging} api={api} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

function Column({ status, tasks, api }: { status: TaskStatus; tasks: Task[]; api: BoardApi }) {
  const { setNodeRef, isOver } = useDroppable({ id: `col-${status}` });
  return (
    <section className="flex w-[82vw] shrink-0 snap-start flex-col sm:w-auto">
      <GroupTitle label={TASK_STATUSES[status]} count={tasks.length} />
      <div
        ref={setNodeRef}
        className={`flex min-h-40 flex-1 flex-col gap-2 rounded-[14px] p-1 outline-1 -outline-offset-1 transition-[outline-color,background-color] duration-150 ${
          isOver ? "bg-white/[0.03] outline-dashed outline-hair" : "outline-transparent"
        }`}
      >
        {tasks.map((t) => (
          <KanbanCard key={t.id} task={t} api={api} />
        ))}
        {tasks.length === 0 && (
          <p className="grid flex-1 place-items-center py-8 text-center text-[12px] font-medium text-faint">Glisse une tâche ici</p>
        )}
      </div>
    </section>
  );
}

function KanbanCard({ task, api }: { task: Task; api: BoardApi }) {
  const drag = useDraggable({ id: task.id, disabled: task.id < 0 || api.openId === task.id });
  const drop = useDroppable({ id: `card-${task.id}` });
  const open = api.openId === task.id;
  return (
    <div
      ref={(node) => {
        drag.setNodeRef(node);
        drop.setNodeRef(node);
      }}
      className={`relative transition-opacity ${drag.isDragging ? "opacity-30" : ""}`}
    >
      {drop.isOver && !drag.isDragging && <span className="absolute inset-x-0 -top-[5px] h-[2px] bg-accent" />}
      <div {...drag.listeners} {...drag.attributes} role="button" aria-roledescription="tâche déplaçable" onClick={() => api.toggle(task.id)}>
        <CardBody task={task} api={api} flat={open} />
      </div>
      {open && (
        <div className="tile rounded-t-none border-t border-hair-soft">
          <TaskEditor task={task} api={api} />
        </div>
      )}
    </div>
  );
}

function CardBody({ task, api, flat = false }: { task: Task; api: BoardApi; flat?: boolean }) {
  const done = task.status === "done";
  return (
    <div className={`tile cursor-grab p-3 active:cursor-grabbing ${flat ? "rounded-b-none" : ""} ${task.id < 0 ? "opacity-60" : ""}`}>
      <p className={`text-[14px] font-semibold leading-snug ${done ? "text-muted line-through decoration-faint" : ""}`}>{task.title}</p>
      {task.details && <p className="mt-1 line-clamp-2 text-[12px] text-muted">{task.details}</p>}
      <div className="mt-2.5 flex min-h-5 items-center justify-between">
        <TaskMeta task={task} api={{ ...api, showApp: false }} />
        {api.showApp && api.appById.get(task.appId) && (
          <AppSwatch emoji={api.appById.get(task.appId)!.emoji} color={api.appById.get(task.appId)!.color} size={20} />
        )}
      </div>
    </div>
  );
}

// ── Édition en place ──────────────────────────────────────────────

function TaskEditor({ task, api }: { task: Task; api: BoardApi }) {
  const [title, setTitle] = useState(task.title);
  const [details, setDetails] = useState(task.details);

  return (
    <div className="rise grid gap-3 px-3 pt-1 pb-3 sm:pl-11" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <input
        className="field"
        value={title}
        aria-label="Titre"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => title.trim() && title !== task.title && api.patch(task.id, { title })}
      />
      <textarea
        className="field min-h-20"
        placeholder="Détails, contexte, liens…"
        value={details}
        aria-label="Détails"
        onChange={(e) => setDetails(e.target.value)}
        onBlur={() => details !== task.details && api.patch(task.id, { details })}
      />
      <div className="flex flex-wrap items-center gap-2">
        <select className="field field-sm w-auto" aria-label="Statut" value={task.status} onChange={(e) => api.patch(task.id, { status: e.target.value })}>
          {Object.entries(TASK_STATUSES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <select className="field field-sm w-auto" aria-label="Priorité" value={task.priority} onChange={(e) => api.patch(task.id, { priority: e.target.value })}>
          {Object.entries(PRIORITIES).map(([k, v]) => (
            <option key={k} value={k}>
              Priorité {v.toLowerCase()}
            </option>
          ))}
        </select>
        <select
          className="field field-sm w-auto"
          aria-label="Qui s'en occupe"
          value={task.assignee ?? ""}
          onChange={(e) => api.patch(task.id, { assignee: e.target.value || null })}
        >
          <option value="">Personne</option>
          {Object.entries(PEOPLE).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          type="date"
          className="field field-sm w-auto"
          aria-label="Échéance"
          value={task.dueDate ?? ""}
          onChange={(e) => api.patch(task.id, { dueDate: e.target.value || null })}
        />
        <select
          className="field field-sm w-auto"
          aria-label="App"
          value={task.appId ?? ""}
          onChange={(e) => api.patch(task.id, { appId: e.target.value ? Number(e.target.value) : null })}
        >
          {api.apps.map((a) => (
            <option key={a.id ?? "commun"} value={a.id ?? ""}>
              {a.name}
            </option>
          ))}
        </select>
        <div className="ml-auto flex items-center gap-1">
          <ConfirmButton onConfirm={() => api.remove(task.id)} />
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Fermer" onClick={() => api.toggle(task.id)}>
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Petits morceaux ───────────────────────────────────────────────

export function Checkbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={checked ? "Marquer à faire" : "Marquer comme fait"}
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`grid size-[20px] shrink-0 cursor-pointer place-items-center rounded-[6px] transition-colors duration-150 ${
        checked ? "bg-ink text-black" : "border-[1.5px] border-faint hover:border-muted"
      }`}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </button>
  );
}

function GroupTitle({ label, count }: { label: string; count: number }) {
  return (
    <h2 className="mb-2 flex items-baseline gap-2 px-1 text-[13px] font-bold">
      {label}
      <span className="font-medium text-muted tabular-nums">{count}</span>
    </h2>
  );
}

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: [T, React.ReactNode][];
}) {
  return (
    <div className="inline-flex rounded-[12px] bg-card p-0.5 ring-1 ring-hair-soft" role="radiogroup">
      {options.map(([key, label]) => (
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={value === key}
          onClick={() => onChange(key)}
          className={`h-7 rounded-[10px] px-3 text-[12px] font-semibold transition-colors duration-150 ${
            value === key ? "bg-ink text-black" : "text-muted hover:text-ink"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function IconLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      <span className="max-sm:sr-only">{label}</span>
    </span>
  );
}

function EmptyTasks() {
  return (
    <div className="tile grid place-items-center gap-1 px-6 py-14 text-center">
      <p className="text-[15px] font-semibold">Rien à faire ici.</p>
      <p className="text-[13px] text-muted">Ajoute la première tâche au-dessus, avec une échéance et qui s&apos;en occupe.</p>
    </div>
  );
}
