/**
 * Resolve the caller's IANA timezone as a header map (`X-Timezone`), so the
 * backend can localize dates without guessing. `Intl` is available on web,
 * Node, and React Native, keeping this agnostic. Returns `{}` when unresolved.
 */
export function getTimezoneHeaders(): Record<string, string> {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timeZone ? { 'X-Timezone': timeZone } : {};
  } catch {
    return {};
  }
}
