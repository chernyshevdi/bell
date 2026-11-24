import { charge, TEST_CARD_DECLINE, TEST_CARD_OK } from './charge';

describe('charge (мок платежа)', () => {
  it('успех на тестовой карте', async () => expect((await charge(TEST_CARD_OK, 0)).ok).toBeTrue());
  it('отказ на карте-отказе, с причиной', async () => {
    const r = await charge(TEST_CARD_DECLINE, 0);
    expect(r.ok).toBeFalse();
    if (!r.ok) expect(r.reason).toContain('отклонил');
  });
});
