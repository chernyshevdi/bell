import { Component, computed, inject } from '@angular/core';
import { BLOCK_REGISTRY } from '../model/block-registry';
import { LayoutStore } from '../model/layout.store';
import { BlockHostComponent } from './block-host.component';

@Component({
  selector: 'app-homepage-grid',
  standalone: true,
  imports: [BlockHostComponent],
  template: `
    <div class="grid">
      @for (b of blocks(); track b.id) {
        <app-block-host [block]="b" [component]="b.component" />
      }
    </div>
  `,
  styles: `
    .grid { display: grid; gap: 24px 24px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
    @media (min-width: 768px) {
      .grid { grid-template-columns: repeat(12, minmax(0, 1fr)); }
    }
  `,
})
export class HomepageGridComponent {
  private layout = inject(LayoutStore);

  blocks = computed(() =>
    this.layout.blocks().flatMap(b => {
      const component = BLOCK_REGISTRY[b.type];
      if (!b.enabled) return [];
      if (!component) { console.warn(`[grid] неизвестный тип блока "${b.type}" (${b.id}) пропущен`); return []; }
      return [{ ...b, component }];
    }),
  );
}
