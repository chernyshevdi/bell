import { Product } from '@entities/product';
import { Webinar } from '@entities/webinar';
import { webinarCta } from './webinar-cta';

const prod = (id: string, over: Partial<Product> = {}): Product =>
  ({ id, name: id, active: true, tagline: '', description: '', benefits: [], fromPrice: null, flow: 'internal', plans: [], ...over });
const none = new Set<string>();
const w = (id: string, startsAt: string | null, over: Partial<Webinar> = {}): Webinar =>
  ({ id, title: id, speaker: null, speakerRole: null, startsAt, productId: 'tech', eventUrl: '', durationMin: 90, ...over });

describe('webinarCta', () => {
  const tech = prod('tech');
  const web = w('t', null, { singlePlanId: 'tech-rub-single', recordingUrl: 'http://rec' });
  it('нет доступа, предстоящий → подписка + разовое участие', () =>
    expect(webinarCta(web, 'upcoming', tech, none)).toEqual({ kind: 'subscribe', label: 'Подписаться', productId: 'tech', singlePlanId: 'tech-rub-single' }));
  it('нет доступа, прошедший → подписка ради записей', () => expect(webinarCta(web, 'past', tech, none).label).toBe('Подписаться, чтобы смотреть записи'));
  it('есть доступ, предстоящий → регистрация', () => expect(webinarCta(web, 'upcoming', tech, new Set(['tech'])).kind).toBe('register'));
  it('Unlimited даёт доступ', () => expect(webinarCta(web, 'upcoming', tech, new Set(['unlimited'])).kind).toBe('register'));
  it('есть доступ, идёт → подключиться', () => expect(webinarCta(web, 'live', tech, new Set(['tech'])).kind).toBe('join'));
  it('есть доступ, прошёл с записью → смотреть', () => expect(webinarCta(web, 'past', tech, new Set(['tech'])).kind).toBe('watch'));
  it('есть доступ, прошёл без записи → скоро', () => expect(webinarCta({ ...web, recordingUrl: null }, 'past', tech, new Set(['tech'])).kind).toBe('soon'));
  it('продукт без онлайн-оплаты → без кнопки', () => expect(webinarCta(web, 'upcoming', prod('invest', { flow: 'none' }), none).kind).toBe('none'));
});
