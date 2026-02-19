export function parseMultiValue(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n|[;|]/)
    .map((v) => v.trim())
    .filter(Boolean);
}
