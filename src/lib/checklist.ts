/** Bascule la case à cocher (`- [ ]` / `- [x]`) à la ligne donnée (1-indexée, comme les positions remark) d'un texte markdown. */
export function toggleCheckboxAtLine(body: string, line: number): string {
  const lines = body.split("\n");
  const raw = lines[line - 1];
  if (raw === undefined) return body;
  const m = raw.match(/^(\s*[-*+]\s+)\[([ xX])\](\s.*)?$/);
  if (!m) return body;
  const checked = m[2].toLowerCase() === "x";
  lines[line - 1] = `${m[1]}[${checked ? " " : "x"}]${m[3] ?? ""}`;
  return lines.join("\n");
}
