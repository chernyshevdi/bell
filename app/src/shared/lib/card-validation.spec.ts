import { cvcValid, emailValid, expiryValid, formatCardNumber, formatExpiry, luhn } from './card-validation';

describe('card-validation', () => {
  it('luhn принимает тестовые карты и отвергает мусор', () => {
    expect(luhn('4242424242424242')).toBeTrue();
    expect(luhn('4000000000000002')).toBeTrue();
    expect(luhn('4242424242424241')).toBeFalse();
    expect(luhn('1234')).toBeFalse();
    expect(luhn('')).toBeFalse();
  });
  it('форматирует номер и срок', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(formatCardNumber('42a42')).toBe('4242');
    expect(formatExpiry('1227')).toBe('12 / 27');
    expect(formatExpiry('1')).toBe('1');
  });
  it('срок действует до конца месяца', () => {
    expect(expiryValid('11 / 26', new Date(2026, 10, 24))).toBeTrue();
    expect(expiryValid('10 / 26', new Date(2026, 10, 24))).toBeFalse();
    expect(expiryValid('13 / 30', new Date(2026, 10, 24))).toBeFalse();
    expect(expiryValid('1', new Date(2026, 10, 24))).toBeFalse();
  });
  it('cvc и email', () => {
    expect(cvcValid('123')).toBeTrue();
    expect(cvcValid('12')).toBeFalse();
    expect(emailValid('a@b.co')).toBeTrue();
    expect(emailValid('a@b')).toBeFalse();
  });
});
