import { Injectable, inject, signal } from '@angular/core';
import { CmsClient } from '@shared/api';

/** Запись конструктора: какой блок и какой ширины. Настройки и содержимое блока лежат в blocks/<id>.json. */
export interface LayoutBlock {
  id: string;
  type: string;
  enabled: boolean;
  span: { desktop: number; mobile: number };
}

@Injectable({ providedIn: 'root' })
export class LayoutStore {
  private cms = inject(CmsClient);
  readonly blocks = signal<LayoutBlock[]>([]);
  readonly loaded = signal(false);
  readonly error = signal(false);

  load(): void {
    this.cms.get<{ blocks: LayoutBlock[] }>('layout').subscribe({
      next: r => { this.blocks.set(r.blocks); this.loaded.set(true); },
      error: () => this.error.set(true),
    });
  }
}
