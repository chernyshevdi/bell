export type Currency = 'USD' | 'RUB';

/** $1, $14.9, 12 800 ₽ — как на thebell.io */
export function formatMoney(amount: number, currency: Currency): string {
  if (currency === 'USD') return '$' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(amount);
  return new Intl.NumberFormat('ru', { maximumFractionDigits: 0 }).format(amount) + '\u00a0₽';
}

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() < day) d.setDate(0); // 31 января + 1 мес = конец февраля
  return d;
}

export function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
