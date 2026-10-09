import { NotesList } from "@/components/notes-list";
import { Page, PageHeader } from "@/components/page-header";
import { boardApps } from "@/lib/board-apps";
import { listNotes } from "@/lib/queries";

export const metadata = { title: "Notes" };

export default async function NotesPage() {
  const [notes, apps] = await Promise.all([listNotes(), boardApps()]);

  return (
    <Page>
      <PageHeader title="Notes" sub={`${notes.length} ${notes.length > 1 ? "notes" : "note"}, toutes apps confondues`} />
      <div className="pb-12">
        <NotesList notes={notes} apps={apps} />
      </div>
    </Page>
  );
}
