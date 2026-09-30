import { APP_STATUSES, PEOPLE, appColor } from "@/lib/meta";

export function StatusBadge({ status }: { status: string }) {
  const label = APP_STATUSES[status as keyof typeof APP_STATUSES] ?? status;
  const tone: Record<string, string> = { prod: "#B5F3C7", dev: "#8CCBFF", idee: "#B79CFF", pause: "#8A8A8E" };
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted">
      <span className="size-1.5 rounded-full" style={{ background: tone[status] ?? "#8A8A8E" }} />
      {label}
    </span>
  );
}

export function PersonBadge({ person, size = 20 }: { person: string | null; size?: number }) {
  if (!person) return null;
  const name = PEOPLE[person as keyof typeof PEOPLE] ?? person;
  return (
    <span
      title={name}
      aria-label={`Assignée à ${name}`}
      className="inline-grid shrink-0 place-items-center rounded-full font-bold text-black"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.5,
        background: person === "stan" ? "#8CCBFF" : "#B79CFF",
      }}
    >
      {name[0]}
    </span>
  );
}

export function AppSwatch({ emoji, color, size = 22 }: { emoji: string; color: string; size?: number }) {
  return (
    <span
      className="relative inline-grid shrink-0 place-items-center overflow-hidden rounded-[6px] bg-card leading-none"
      style={{ width: size, height: size, fontSize: size * 0.58 }}
      aria-hidden="true"
    >
      {emoji}
      <span className="absolute inset-x-0 bottom-0 h-[2px]" style={{ background: appColor(color) }} />
    </span>
  );
}
