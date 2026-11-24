import { Product } from '@entities/product';
import { ShowcaseSettings, ShowcaseSlide } from './types';

const DAY_MS = 86_400_000;

/**
 * Какой слайд показать. Чистая функция: время и подписки приходят параметрами.
 * rotation детерминирована (одинакова у всех в один период), без рандома.
 * Слайды продуктов, которые неактивны или уже куплены, пропускаются; если подходящих нет, null (блок скрывается).
 */
export function pickSlide(
  config: ShowcaseSettings,
  slides: ShowcaseSlide[],
  products: Product[],
  subscribedIds: ReadonlySet<string>,
  now: Date,
): ShowcaseSlide | null {
  const slideById = new Map(slides.map(s => [s.id, s]));
  const productById = new Map(products.map(p => [p.id, p]));
  const eligible = (id?: string): ShowcaseSlide | null => {
    const s = id ? slideById.get(id) : undefined;
    const p = s ? productById.get(s.productId) : undefined;
    return s && p && p.active && !subscribedIds.has(p.id) ? s : null;
  };

  if (config.mode === 'manual') return eligible(config.slideId);

  const ids = config.slideIds ?? [];
  if (ids.length > 0) {
    const period = Math.max(1, config.periodDays || 1) * DAY_MS;
    const slot = Math.max(0, Math.floor((now.getTime() - new Date(config.startDate).getTime()) / period));
    for (let k = 0; k < ids.length; k++) {
      const hit = eligible(ids[(slot + k) % ids.length]);
      if (hit) return hit;
    }
  }
  return null;
}
