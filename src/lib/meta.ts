// Vocabulaire partagé : statuts, priorités, catégories, couleurs d'app.

export const APP_COLORS = {
  green: "#B5F3C7",
  purple: "#B79CFF",
  blue: "#8CCBFF",
  gold: "#F8CA5A",
} as const;
export type AppColor = keyof typeof APP_COLORS;

export function appColor(color: string | null | undefined): string {
  return APP_COLORS[(color as AppColor) ?? "blue"] ?? APP_COLORS.blue;
}

export const APP_STATUSES = {
  idee: "Idée",
  dev: "En dev",
  prod: "En prod",
  pause: "En pause",
} as const;

export const TASK_STATUSES = {
  todo: "À faire",
  doing: "En cours",
  done: "Fait",
} as const;
export type TaskStatus = keyof typeof TASK_STATUSES;

export const PRIORITIES = {
  haute: "Haute",
  normale: "Normale",
  basse: "Basse",
} as const;
export const PRIORITY_RANK: Record<string, number> = { haute: 0, normale: 1, basse: 2 };

export const PEOPLE = {
  stan: "Stan",
  anat: "Anat",
} as const;

export const PAYERS = {
  commun: "Commun",
  stan: "Stan",
  anat: "Anat",
} as const;

export const SERVICE_CATEGORIES = {
  hebergement: "Hébergement",
  bdd: "Base de données",
  store: "Store",
  paiement: "Paiement",
  auth: "Auth",
  email: "Email",
  analytics: "Analytics",
  ia: "IA",
  domaine: "Domaine",
  design: "Design",
  autre: "Autre",
} as const;

export const COMMUN = "commun";

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

export function formatDue(date: string | null): { label: string; late: boolean; soon: boolean } | null {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${date}T00:00:00`);
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  const label =
    days === 0
      ? "Aujourd'hui"
      : days === 1
        ? "Demain"
        : days === -1
          ? "Hier"
          : new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(d);
  return { label, late: days < 0, soon: days >= 0 && days <= 2 };
}
