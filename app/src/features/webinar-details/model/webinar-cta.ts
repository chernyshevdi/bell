import { Product } from '@entities/product';
import { hasAccess } from '@entities/subscription';
import { Webinar, WebinarStatus } from '@entities/webinar';

export type CtaKind = 'register' | 'join' | 'watch' | 'subscribe' | 'soon' | 'none';
export interface WebinarCta {
  kind: CtaKind;
  label: string;
  /** продукт, чью модалку тарифов открыть (для kind = subscribe) */
  productId?: string;
  /** можно купить разовое участие без подписки */
  singlePlanId?: string;
}

/**
 * Что сделать с кнопкой вебинара. Доступ есть, если куплен продукт вебинара или Unlimited.
 * У продуктов без онлайн-оплаты (flow = none) действия нет.
 */
export function webinarCta(w: Webinar, status: WebinarStatus, product: Product | undefined, subscribedIds: ReadonlySet<string>): WebinarCta {
  if (!product || product.flow === 'none') return { kind: 'none', label: '' };
  if (hasAccess(subscribedIds, product.id)) {
    if (status === 'live') return { kind: 'join', label: 'Подключиться' };
    if (status === 'upcoming') return { kind: 'register', label: 'Зарегистрироваться' };
    return w.recordingUrl ? { kind: 'watch', label: 'Смотреть запись' } : { kind: 'soon', label: 'Запись скоро появится' };
  }
  const base = { kind: 'subscribe' as const, productId: product.id };
  if (status === 'past') return { ...base, label: 'Подписаться, чтобы смотреть записи' };
  return { ...base, label: 'Подписаться', singlePlanId: w.singlePlanId };
}
