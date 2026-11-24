import { digits } from '@shared/lib';

/**
 * Мок платежа. Настоящая оплата на проде: hosted checkout провайдера,
 * данные карты во фронт приложения не попадают (PCI DSS).
 */
export const TEST_CARD_OK = '4242424242424242';
export const TEST_CARD_DECLINE = '4000000000000002';

export type ChargeResult = { ok: true } | { ok: false; reason: string };

export function charge(cardNumber: string, delayMs = 1200): Promise<ChargeResult> {
  const n = digits(cardNumber);
  return new Promise(resolve => setTimeout(() => {
    if (n === TEST_CARD_DECLINE) resolve({ ok: false, reason: 'Банк отклонил платёж. Попробуйте другую карту.' });
    else resolve({ ok: true });
  }, delayMs));
}
