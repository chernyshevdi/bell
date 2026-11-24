import { Injectable, InjectionToken, inject, signal } from '@angular/core';

/**
 * Часы приложения. Если CMS прислала `serverTime`, «сейчас» считается от серверного времени
 * (поправка на расхождение с часами браузера), иначе по локальным часам.
 * Нужны для ротации витрины и статусов вебинаров: их должны определять часы сервера, а не пользователя.
 */
@Injectable({ providedIn: 'root' })
export class ServerClock {
  private offsetMs = signal(0);

  /** Запоминает расхождение с сервером. Некорректная дата игнорируется. */
  sync(serverTimeIso: string | undefined | null): void {
    const t = serverTimeIso ? Date.parse(serverTimeIso) : NaN;
    if (!Number.isNaN(t)) this.offsetMs.set(t - Date.now());
  }

  now(): Date {
    return new Date(Date.now() + this.offsetMs());
  }
}

/** Источник «сейчас». Читает ServerClock, поэтому всё приложение живёт по одним часам. */
export const NOW = new InjectionToken<() => Date>('NOW', {
  providedIn: 'root',
  factory: () => {
    const clock = inject(ServerClock);
    return () => clock.now();
  },
});
