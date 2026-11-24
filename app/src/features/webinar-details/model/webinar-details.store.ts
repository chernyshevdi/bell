import { Injectable, signal } from '@angular/core';

/** Какая карточка вебинара открыта в детализации. */
@Injectable({ providedIn: 'root' })
export class WebinarDetailsStore {
  readonly webinarId = signal<string | null>(null);
  open(id: string): void { this.webinarId.set(id); }
  close(): void { this.webinarId.set(null); }
}
