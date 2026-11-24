import { Webinar } from './types';
import { sortWebinars, webinarStatus } from './webinar-status';

const d = (s: string) => new Date(s);

const w = (id: string, startsAt: string | null, over: Partial<Webinar> = {}): Webinar =>
  ({ id, title: id, speaker: null, speakerRole: null, startsAt, productId: 'tech', eventUrl: '', durationMin: 90, ...over });

describe('webinarStatus', () => {
  const x = w('a', '2026-11-24T17:00:00+01:00');
  it('upcoming до начала', () => expect(webinarStatus(x, d('2026-11-24T15:59:59Z'))).toBe('upcoming'));
  it('live ровно в начале', () => expect(webinarStatus(x, d('2026-11-24T16:00:00Z'))).toBe('live'));
  it('live до конца', () => expect(webinarStatus(x, d('2026-11-24T17:29:59Z'))).toBe('live'));
  it('past после окончания', () => expect(webinarStatus(x, d('2026-11-24T17:30:00Z'))).toBe('past'));
  it('override важнее даты', () => expect(webinarStatus({ ...x, statusOverride: 'past' }, d('2026-01-01T00:00:00Z'))).toBe('past'));
  it('без даты считается upcoming', () => expect(webinarStatus(w('n', null), d('2026-11-24T00:00:00Z'))).toBe('upcoming'));
});

describe('sortWebinars', () => {
  const list = [
    w('dashevsky', '2026-09-14T18:00:00+02:00'), w('libermans', '2026-10-14T20:00:00+02:00'), w('peshkin', '2026-11-18T18:00:00+01:00'),
    w('arkhipova', '2026-12-03T19:00:00+01:00'), w('tech-ai', '2026-11-24T17:00:00+01:00'),
  ];
  const now = d('2026-11-24T16:30:00Z');
  it('live → upcoming → past (свежие первыми)', () =>
    expect(sortWebinars(list, now).map(x => x.id)).toEqual(['tech-ai', 'arkhipova', 'peshkin', 'libermans', 'dashevsky']));
  it('limit обрезает хвост', () => expect(sortWebinars(list, now, 3).map(x => x.id)).toEqual(['tech-ai', 'arkhipova', 'peshkin']));
  it('includePast=false убирает прошедшие', () => expect(sortWebinars(list, now, 10, false).map(x => x.id)).toEqual(['tech-ai', 'arkhipova']));
  it('не мутирует вход', () => { const copy = [...list]; sortWebinars(list, now); expect(list).toEqual(copy); });
});
