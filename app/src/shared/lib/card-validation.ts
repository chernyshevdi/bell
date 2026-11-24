/** Проверки и маски полей карты. Сами данные карты нигде не сохраняются. */
export function digits(s: string): string { return s.replace(/\D/g, ''); }

export function luhn(num: string): boolean {
  const d = digits(num);
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let x = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) { x *= 2; if (x > 9) x -= 9; }
    sum += x;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(s: string): string {
  return digits(s).slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
}

export function formatExpiry(s: string): string {
  const d = digits(s).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d;
}

/** MM / ГГ действителен до конца указанного месяца */
export function expiryValid(s: string, now: Date): boolean {
  const d = digits(s);
  if (d.length !== 4) return false;
  const month = Number(d.slice(0, 2));
  const year = 2000 + Number(d.slice(2));
  if (month < 1 || month > 12) return false;
  return new Date(year, month, 1).getTime() > now.getTime();
}

export function cvcValid(s: string): boolean { return /^\d{3,4}$/.test(s); }
export function emailValid(s: string): boolean { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim()); }

