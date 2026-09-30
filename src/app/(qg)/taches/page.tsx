import { Page, PageHeader } from "@/components/page-header";
import { TaskBoard } from "@/components/task-board";
import { boardApps } from "@/lib/board-apps";
import { listTasks } from "@/lib/queries";

export const metadata = { title: "Tâches" };

export default async function TasksPage() {
  const [tasks, apps] = await Promise.all([listTasks(), boardApps()]);
  const open = tasks.filter((t) => t.status !== "done").length;
  return (
    <Page>
      <PageHeader title="Toutes les tâches" sub={`${open} ${open > 1 ? "ouvertes" : "ouverte"}, toutes apps confondues`} />
      <div className="pb-12">
        <TaskBoard tasks={tasks} apps={apps} scope="all" />
      </div>
    </Page>
  );
}
