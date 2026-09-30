import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteApp, updateApp } from "@/app/actions";
import { AppForm } from "@/components/app-form";
import { DeleteAppButton } from "@/components/delete-app";
import { Page, PageHeader } from "@/components/page-header";
import { getApp, parseScope } from "@/lib/queries";

export const metadata = { title: "Modifier l'app" };

export default async function EditAppPage({ params }: PageProps<"/apps/[scope]/modifier">) {
  const { scope } = await params;
  const id = parseScope(scope);
  if (!id) notFound();
  const app = await getApp(id);
  if (!app) notFound();

  return (
    <Page>
      <PageHeader title={`Modifier ${app.name}`} />
      <AppForm app={app} action={updateApp.bind(null, app.id)}>
        <DeleteAppButton action={deleteApp.bind(null, app.id)} name={app.name} />
        <Link href={`/apps/${app.id}`} className="btn btn-ghost">
          Annuler
        </Link>
      </AppForm>
    </Page>
  );
}
