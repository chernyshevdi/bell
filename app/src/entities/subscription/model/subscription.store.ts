import { Injectable, signal } from '@angular/core';

const SUBS_KEY = 'bell.subscriptions';
const REG_KEY = 'bell.webinar-registrations';

function load(key: string): ReadonlySet<string> {
  try {
    const raw = localStorage.getItem(key);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}
function save(key: string, set: ReadonlySet<string>): void {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch { /* хранилище недоступно: работаем в памяти */ }
}

/** Что купил пользователь: подписки на продукты и регистрации на вебинары. Бэкенда нет, поэтому localStorage. */
@Injectable({ providedIn: 'root' })
export class SubscriptionStore {
  readonly subscribedIds = signal<ReadonlySet<string>>(load(SUBS_KEY));
  readonly registeredWebinars = signal<ReadonlySet<string>>(load(REG_KEY));

  addSubscription(productId: string): void {
    const next = new Set(this.subscribedIds()).add(productId);
    this.subscribedIds.set(next);
    save(SUBS_KEY, next);
  }

  registerWebinar(webinarId: string): void {
    const next = new Set(this.registeredWebinars()).add(webinarId);
    this.registeredWebinars.set(next);
    save(REG_KEY, next);
  }
}
