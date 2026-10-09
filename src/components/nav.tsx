"use client";

import { KeyRound, Layers, LayoutGrid, ListChecks, Plus, StickyNote } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppSwatch } from "./badges";
import { Logo } from "./logo";

type NavApp = { id: number; name: string; emoji: string; color: string; open: number };

const SECTIONS = [
  { href: "/", label: "Vue d'ensemble", icon: LayoutGrid },
  { href: "/taches", label: "Tâches", icon: ListChecks },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/acces", label: "Accès", icon: KeyRound },
  { href: "/stack", label: "Stack", icon: Layers },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function Rail({ apps, openTasks, monthly }: { apps: NavApp[]; openTasks: number; monthly: string }) {
  const pathname = usePathname();
  const meta: Record<string, string> = { "/taches": String(openTasks), "/stack": monthly };

  return (
    <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-hair-soft bg-rail md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <Logo />
        <span className="text-[17px] font-extrabold tracking-[-0.01em]">QG</span>
        <span className="text-[12px] font-medium text-muted">Stan & Anat</span>
      </Link>

      <nav className="flex flex-col gap-0.5 px-3" aria-label="Sections">
        {SECTIONS.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[13.5px] font-semibold transition-colors ${
                active ? "bg-white/[0.08] text-ink" : "text-muted hover:bg-white/[0.04] hover:text-ink"
              }`}
            >
              <Icon size={16} strokeWidth={2.2} />
              <span className="flex-1">{label}</span>
              {meta[href] && <span className="text-[12px] font-medium text-muted tabular-nums">{meta[href]}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-7 flex items-center justify-between px-5 pb-2">
        <span className="text-[12px] font-semibold text-muted">Apps</span>
        <Link href="/apps/nouvelle" className="btn btn-ghost btn-icon -mr-2 size-7" aria-label="Nouvelle app" title="Nouvelle app">
          <Plus size={15} />
        </Link>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-6" aria-label="Apps">
        {apps.map((app) => {
          const href = `/apps/${app.id}`;
          const active = isActive(pathname, href);
          return (
            <Link
              key={app.id}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-9 items-center gap-2.5 rounded-[10px] px-2.5 text-[13.5px] font-semibold transition-colors ${
                active ? "bg-white/[0.08] text-ink" : "text-muted hover:bg-white/[0.04] hover:text-ink"
              }`}
            >
              <AppSwatch emoji={app.emoji} color={app.color} />
              <span className="flex-1 truncate">{app.name}</span>
              {app.open > 0 && <span className="text-[12px] font-medium text-muted tabular-nums">{app.open}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-hair-soft bg-rail/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      {SECTIONS.map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href) || (href === "/" && pathname.startsWith("/apps"));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${active ? "text-ink" : "text-muted"}`}
          >
            <Icon size={20} strokeWidth={2.1} />
            {label === "Vue d'ensemble" ? "Apps" : label}
          </Link>
        );
      })}
    </nav>
  );
}
