/** Время вебинара дублируем: CET (как на источнике) и местное, если оно отличается. */
export function formatWebinarTime(iso: string | null, withYear = false): { cet: string; local: string | null } {
  if (!iso) return { cet: 'Дата уточняется', local: null };
  const d = new Date(iso);
  const cet = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', ...(withYear ? { year: 'numeric' as const } : {}), hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin' }).format(d).replace(',', ' в') + ' CET';
  const hm = (tz?: string) => new Intl.DateTimeFormat('ru', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(d);
  return { cet, local: hm() === hm('Europe/Berlin') ? null : `у вас ${hm()}` };
}

/** «, биолог, Гарвардский университет» — роль спикера после имени. */
export function formatSpeakerRole(role: string | null): string {
  return role ? ', ' + role.charAt(0).toLowerCase() + role.slice(1) : '';
}
