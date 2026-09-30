import { Page, PageHeader } from "@/components/page-header";
import { Vault } from "@/components/vault";
import { boardApps } from "@/lib/board-apps";
import { listCredentials } from "@/lib/queries";

export const metadata = { title: "Accès" };

export default async function AccessPage() {
  const [credentials, apps] = await Promise.all([listCredentials(), boardApps()]);
  return (
    <Page>
      <PageHeader title="Accès" sub={`${credentials.length} ${credentials.length > 1 ? "identifiants" : "identifiant"}, toutes apps confondues`} />
      <div className="pb-12">
        <Vault credentials={credentials} apps={apps} scope="all" />
      </div>
    </Page>
  );
}
