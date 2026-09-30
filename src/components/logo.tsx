// Le logo est un plateau de memory 2×2 : trois cartes cachées, une retournée.
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
      <rect width="22" height="22" rx="5" fill="#1C1C1E" />
      <rect x="2" y="2" width="8" height="8" rx="2" fill="#000" />
      <rect x="12" y="2" width="8" height="8" rx="2" fill="#F5F5F5" />
      <rect x="2" y="12" width="8" height="8" rx="2" fill="#000" />
      <rect x="12" y="12" width="8" height="8" rx="2" fill="#000" />
    </svg>
  );
}
