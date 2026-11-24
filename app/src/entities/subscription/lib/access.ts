/** Unlimited — общая подписка: открывает все продукты. */
export const UNLIMITED_PRODUCT_ID = 'unlimited';

/**
 * Есть ли у пользователя доступ к продукту: своя подписка на него или подписка Unlimited.
 * Единое правило и для витрины (что не предлагать), и для вебинаров (что разрешить).
 */
export function hasAccess(subscribedIds: ReadonlySet<string>, productId: string): boolean {
  return subscribedIds.has(productId) || subscribedIds.has(UNLIMITED_PRODUCT_ID);
}
