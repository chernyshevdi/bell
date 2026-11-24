import { Injectable, computed, signal } from '@angular/core';
import { Webinar } from './types';

/**
 * Реестр вебинаров. Данные приходят из блока «вебинары» (CMS), стор нужен фичам,
 * которым надо найти вебинар по id (детализация, оформление).
 */
@Injectable({ providedIn: 'root' })
export class WebinarStore {
  readonly webinars = signal<Webinar[]>([]);
  private byId = computed(() => new Map(this.webinars().map(w => [w.id, w])));

  set(list: Webinar[]): void {
    this.webinars.set(list);
  }

  find(id: string | undefined | null): Webinar | undefined {
    return id ? this.byId().get(id) : undefined;
  }
}
