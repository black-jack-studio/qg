import { Page, PageHeader } from "@/components/page-header";
import { Stack } from "@/components/stack";
import { boardApps } from "@/lib/board-apps";
import { listServices } from "@/lib/queries";

export const metadata = { title: "Stack" };

export default async function StackPage() {
  const [services, apps] = await Promise.all([listServices(), boardApps()]);
  return (
    <Page>
      <PageHeader title="Stack & coûts" sub="Tous les services qui font tourner vos apps" />
      <div className="pb-12">
        <Stack services={services} apps={apps} scope="all" />
      </div>
    </Page>
  );
}
