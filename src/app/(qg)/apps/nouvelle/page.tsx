import Link from "next/link";
import { createApp } from "@/app/actions";
import { AppForm } from "@/components/app-form";
import { Page, PageHeader } from "@/components/page-header";

export const metadata = { title: "Nouvelle app" };

export default function NewAppPage() {
  return (
    <Page>
      <PageHeader title="Nouvelle app" sub="Elle apparaîtra sur le plateau avec ses tâches, accès, stack et notes." />
      <AppForm action={createApp}>
        <Link href="/" className="btn btn-ghost">
          Annuler
        </Link>
      </AppForm>
    </Page>
  );
}
