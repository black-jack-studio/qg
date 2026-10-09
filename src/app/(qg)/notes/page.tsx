import { NotesAndLinks } from "@/components/notes";
import { Page, PageHeader } from "@/components/page-header";
import { boardApps } from "@/lib/board-apps";
import { listLinks, listNotes } from "@/lib/queries";

export const metadata = { title: "Notes" };

export default async function NotesPage() {
  const [notes, links, apps] = await Promise.all([listNotes(), listLinks(), boardApps()]);

  return (
    <Page>
      <PageHeader
        title="Notes"
        sub={`${notes.length} ${notes.length > 1 ? "notes" : "note"}, toutes apps confondues`}
      />
      <div className="pb-12">
        <NotesAndLinks notes={notes} links={links} appId={null} apps={apps} scope="all" />
      </div>
    </Page>
  );
}
