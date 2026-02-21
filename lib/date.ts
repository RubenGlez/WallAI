/**
 * Formats an ISO date string for relative display:
 * - Today: time only (short)
 * - Yesterday: date (medium)
 * - Older: date (short)
 */
export function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) {
    return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(d);
  }
  if (diffDays === 1) {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      d
    );
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "short" }).format(d);
}
