import { Component, HostBinding, computed, effect, inject, input, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { Type } from '@angular/core';
import { retry } from 'rxjs';
import { CmsClient } from '@shared/api';
import { ServerClock } from '@shared/lib';
import { BlockPayload } from '../model/block-payload';
import { LayoutBlock } from '../model/layout.store';

/**
 * Одна клетка сетки: сама загружает файл своего блока (blocks/<id>.json) и показывает виджет.
 * Пока блок грузится или если файл не загрузился (после одного повтора), клетка скрыта,
 * соседние блоки это не затрагивает.
 */
@Component({
  selector: 'app-block-host',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    @if (payload(); as p) {
      <ng-container *ngComponentOutlet="component(); inputs: { settings: p.settings ?? {}, content: p.content ?? {} }" />
    }
  `,
  styles: `
    :host { display: block; grid-column: span var(--span-m, 4); min-width: 0; }
    :host(.is-hidden) { display: none; }
    @media (min-width: 768px) { :host { grid-column: span var(--span-d, 12); } }
  `,
})
export class BlockHostComponent {
  private cms = inject(CmsClient);
  private clock = inject(ServerClock);

  block = input.required<LayoutBlock>();
  component = input.required<Type<unknown>>();
  payload = signal<BlockPayload | null>(null);

  private visible = computed(() => this.payload() !== null);

  @HostBinding('class.is-hidden') get hidden() { return !this.visible(); }
  @HostBinding('attr.data-block') get type() { return this.block().type; }
  @HostBinding('style.--span-d') get spanD() { return this.block().span.desktop; }
  @HostBinding('style.--span-m') get spanM() { return this.block().span.mobile; }

  constructor() {
    effect(() => {
      const id = this.block().id;
      this.cms.get<BlockPayload>(`blocks/${id}`).pipe(retry(1)).subscribe({
        next: p => { this.clock.sync(p.serverTime); this.payload.set(p ?? {}); },
        error: err => console.error(`[блок ${id}] не удалось загрузить, блок скрыт`, err),
      });
    });
  }
}
