/**
 * Generates a unique ID with an optional prefix (e.g. "palette", "doodle").
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
