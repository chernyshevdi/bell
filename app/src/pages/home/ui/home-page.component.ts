import { Component, computed, inject, OnInit } from '@angular/core';
import { ProductStore } from '@entities/product';
import { LayoutStore } from '../model/layout.store';
import { HomepageGridComponent } from './homepage-grid.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HomepageGridComponent],
  template: `
    <main class="page">
      <h1 class="page__h">The Bell — деловые новости и аналитика</h1>
      @if (failed()) {
        <p class="page__err" role="alert">Не удалось загрузить данные. Обновите страницу.</p>
      } @else if (!ready()) {
        <p class="page__loading" role="status">Загрузка…</p>
      } @else {
        <app-homepage-grid />
      }
    </main>
  `,
  styles: `
    .page { max-width: var(--container); margin: 0 auto; padding: 24px var(--gutter) 64px; }
    .page__h { font: 500 28px/1.2 var(--f-head); margin: 0 0 16px; }
    @media (max-width: 767px) { .page { padding-top: 8px; } .page__h { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); margin: 0; } }
    .page__err { color: var(--c-accent); }
    .page__loading { color: var(--c-grey-500); }
  `,
})
export class HomePageComponent implements OnInit {
  private layout = inject(LayoutStore);
  private products = inject(ProductStore);
  /** страница ждёт только состав блоков; каждый блок грузит и показывает себя сам */
  ready = computed(() => this.layout.loaded());
  failed = computed(() => this.layout.error());

  ngOnInit() {
    this.layout.load();
    this.products.load(); // справочник продуктов и цен: нужен витрине и окнам оплаты, но не блокирует страницу
  }
}
