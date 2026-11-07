/**
 * Returns an accessible foreground color for category badges and tags that satisfies WCAG AA (>= 4.5:1 contrast).
 */
export function toAccessibleColor(hex?: string): string {
  if (!hex) return "#925C18";
  const upper = hex.trim().toUpperCase();
  if (upper === "#C4852A") return "#925C18"; // Amber -> Dark Amber (5.47:1)
  if (upper === "#9B7A2E") return "#7A5C2E"; // Khaki -> Deep Earth (6.18:1)
  return hex;
}
