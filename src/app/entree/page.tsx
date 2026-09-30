import { Logo } from "@/components/logo";
import { EntryForm } from "./entry-form";

export const metadata = { title: "Entrée" };

export default function EntryPage() {
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-[320px]">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo size={56} />
          <div>
            <h1 className="text-[26px] font-extrabold tracking-[-0.02em]">QG</h1>
            <p className="mt-1 text-[14px] font-medium text-muted">Réservé à Stan & Anat.</p>
          </div>
        </div>
        <EntryForm />
      </div>
    </main>
  );
}
