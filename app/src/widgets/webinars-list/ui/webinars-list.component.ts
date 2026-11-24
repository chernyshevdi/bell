import { Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input, signal } from '@angular/core';
import { ProductStore } from '@entities/product';
import { WebinarCardComponent, WebinarStore, sortWebinars, webinarStatus } from '@entities/webinar';
import { WebinarDetailsStore } from '@features/webinar-details';
import { NOW } from '@shared/lib';
import { Webinar } from '@entities/webinar';

/** Сколько карточек в ряду на десктопе и планшете. */
const PER_ROW = 3;
/** Сколько рядов видно сразу; остальные раскрывает «Показать ещё». Оформление, поэтому в коде, а не в CMS. */
const INITIAL_ROWS = 1;

/** settings блока (blocks/webinars.json) */
export interface WebinarsSettings {
  title?: string;
  includePast?: boolean;
  /** всего карточек */
  limit?: number;
}
/** content блока */
export interface WebinarsContent {
  webinars: Webinar[];
}

/** Блок вебинаров: список из content.webinars, поведение из settings. */
@Component({
  selector: 'app-webinars',
  standalone: true,
  imports: [WebinarCardComponent],
  template: `
    @if (cards().length) {
      <section class="web" [attr.aria-label]="title()">
        <h2 class="web__h">{{ title() }}</h2>
        <ul class="web__list">
          @for (c of cards(); track c.webinar.id; let i = $index) {
            <li [class.is-extra]="i >= visible()">
              <app-webinar-card [webinar]="c.webinar" [status]="c.status" [productName]="c.productName" [theme]="c.theme" (selected)="details.open(c.webinar.id)" />
            </li>
          }
        </ul>
        @if (hidden() > 0) {
          <div class="web__more">
            <button type="button" class="btn btn--ghost" (click)="showMore()">Показать ещё</button>
          </div>
        }
      </section>
    }
  `,
  styles: `
    .web__h { font: 500 26px/1.2 var(--f-head); margin: 0 0 16px; }
    .web__list { list-style: none; margin: 0; padding: 0 var(--gutter) 8px; margin-inline: calc(var(--gutter) * -1);
      display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: var(--gutter); scrollbar-width: none; }
    .web__list::-webkit-scrollbar { display: none; }
    .web__list > li { flex: 0 0 78%; scroll-snap-align: start; }
    .web__more { display: none; }
    @media (min-width: 768px) {
      .web__list { display: grid; grid-template-columns: repeat(3, 1fr); overflow: visible; padding: 0; margin-inline: 0; gap: 16px; }
      .web__list > li { flex: initial; }
      .web__list > li.is-extra { display: none; }
      .web__more { display: flex; justify-content: center; margin-top: 20px; }
    }
  `,
})
export class WebinarsListComponent {
  private registry = inject(WebinarStore);
  private products = inject(ProductStore);
  private now = inject(NOW);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  details = inject(WebinarDetailsStore);

  settings = input<WebinarsSettings>({});
  content = input<WebinarsContent>({ webinars: [] });
  private list = computed(() => this.content()?.webinars ?? []);
  title = computed(() => this.settings()?.title ?? 'Вебинары');

  constructor() {
    // фичам (детализация, оформление) нужен поиск вебинара по id
    effect(() => this.registry.set(this.list()));
  }

  private extraRows = signal(0);
  /** На мобильном все карточки лежат в одной ленте, «Показать ещё» там скрыта (см. CSS). */
  visible = computed(() => (INITIAL_ROWS + this.extraRows()) * PER_ROW);

  cards = computed(() => {
    const now = this.now();
    const s = this.settings() ?? {};
    const list = sortWebinars(this.list(), now, Number(s.limit ?? 12), s.includePast !== false);
    return list.map(webinar => {
      const product = this.products.find(webinar.productId);
      return { webinar, status: webinarStatus(webinar, now), productName: product?.name ?? '', theme: product?.theme };
    });
  });
  hidden = computed(() => Math.max(0, this.cards().length - this.visible()));

  showMore() {
    const firstNew = this.visible();
    this.extraRows.update(n => n + 1);
    // кнопка может исчезнуть: переводим фокус на первую раскрытую карточку
    afterNextRender(() => this.host.nativeElement.querySelectorAll<HTMLElement>('.web__list > li button')[firstNew]?.focus(), { injector: this.injector });
  }
  private injector = inject(Injector);
}
