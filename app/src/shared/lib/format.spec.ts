import { addMonths, formatMoney } from './format';

describe('format', () => {
  it('деньги как на сайте', () => {
    expect(formatMoney(1, 'USD')).toBe('$1');
    expect(formatMoney(14.9, 'USD')).toBe('$14.9');
    expect(formatMoney(399, 'USD')).toBe('$399');
    expect(formatMoney(12800, 'RUB')).toContain('₽');
  });
  it('addMonths не перепрыгивает конец месяца', () => {
    expect(addMonths(new Date(2026, 0, 31), 1).getMonth()).toBe(1);
    expect(addMonths(new Date(2026, 10, 24), 12).getFullYear()).toBe(2027);
  });
});
