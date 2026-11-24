import { Webinar, WebinarStatus } from './types';

const DEFAULT_DURATION_MIN = 90;

/** upcoming / live / past по дате; ручной override из CMS перекрывает расчёт. */
export function webinarStatus(w: Webinar, now: Date): WebinarStatus {
  if (w.statusOverride) return w.statusOverride;
  if (!w.startsAt) return 'upcoming';
  const start = new Date(w.startsAt).getTime();
  const end = start + (w.durationMin ?? DEFAULT_DURATION_MIN) * 60_000;
  const t = now.getTime();
  if (t < start) return 'upcoming';
  if (t < end) return 'live';
  return 'past';
}

/** Идущие → ближайшие предстоящие (по возрастанию) → прошедшие (свежие первыми); затем limit. */
export function sortWebinars(list: Webinar[], now: Date, limit = Infinity, includePast = true): Webinar[] {
  const rank: Record<WebinarStatus, number> = { live: 0, upcoming: 1, past: 2 };
  const time = (w: Webinar) => (w.startsAt ? new Date(w.startsAt).getTime() : Infinity);
  return list
    .map(w => ({ w, s: webinarStatus(w, now) }))
    .filter(x => includePast || x.s !== 'past')
    .sort((a, b) => rank[a.s] - rank[b.s] || (a.s === 'past' ? time(b.w) - time(a.w) : time(a.w) - time(b.w)))
    .slice(0, limit)
    .map(x => x.w);
}

export const STATUS_LABEL: Record<WebinarStatus, string> = { live: 'Идёт сейчас', upcoming: 'Регистрация открыта', past: 'Прошёл' };
