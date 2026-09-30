import { Rail, TabBar } from "@/components/nav";
import { formatEuros } from "@/lib/meta";
import { listApps, listServices } from "@/lib/queries";

// Données vivantes partagées à deux : jamais de rendu figé au build.
export const dynamic = "force-dynamic";

export default async function QGLayout({ children }: { children: React.ReactNode }) {
  const [{ apps, commun }, services] = await Promise.all([listApps(), listServices()]);
  const openTasks = apps.reduce((n, a) => n + a.open, commun.open);
  const monthly = services.reduce((n, s) => n + s.monthlyCostCents, 0);

  const navApps = apps.map((a) => ({ id: a.id, name: a.name, emoji: a.emoji, color: a.color, open: a.open }));

  return (
    <div className="flex min-h-dvh">
      <Rail apps={navApps} openTasks={openTasks} monthly={`${formatEuros(monthly)}/mois`} />
      <main className="min-w-0 flex-1 pb-24 md:pb-0">{children}</main>
      <TabBar />
    </div>
  );
}
