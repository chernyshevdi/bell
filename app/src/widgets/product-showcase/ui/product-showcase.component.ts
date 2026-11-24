import { Component, computed, inject, input } from '@angular/core';
import { ArticleCardComponent } from '@entities/article';
import { ProductStore } from '@entities/product';
import { SubscriptionStore } from '@entities/subscription';
import { SubscriptionFlowStore } from '@features/subscription-flow';
import { NOW } from '@shared/lib';
import { pickSlide } from '../model/pick-slide';
import { ShowcaseContent, ShowcaseSettings } from '../model/types';

const DEFAULT_CTA = 'Выбрать тариф';
const CARDS = 3;

/**
 * Витрина: заголовок, три материала продукта и широкая карточка «ещё по подписке».
 * Какой слайд показан сегодня, решает pickSlide по settings блока;
 * заголовок, карточки и тексты слайдов лежат в content (blocks/showcase.json).
 */
@Component({
  selector: 'app-product-showcase',
  standalone: true,
  imports: [ArticleCardComponent],
  template: `
    @if (slide(); as s) {
      <section class="show" [attr.aria-label]="s.heading" [attr.data-slide]="s.id" [attr.data-product]="s.productId">
        <h2 class="show__h">{{ s.heading }}</h2>
        <ul class="show__cards">
          @for (c of cards(); track c.title; let first = $first) {
            <li><app-article-card [item]="c" [eager]="first" /></li>
          }
        </ul>
        <div class="more">
          <div class="more__text">
            <h3 class="more__title">{{ s.more.title }}</h3>
            @if (s.more.text) { <p class="more__desc">{{ s.more.text }}</p> }
          </div>
          <div class="more__buy">
            @if (s.more.price) { <p class="more__price">{{ s.more.price }}</p> }
            @if (hasCheckout()) {
              <button type="button" class="btn more__cta" (click)="open(s.productId)">{{ s.more.cta ?? defaultCta }}</button>
            } @else {
              <p class="more__note">Оформить подписку онлайн скоро будет можно</p>
            }
          </div>
        </div>
      </section>
    }
  `,
  styles: `
    .show { --pad: 16px; padding: var(--pad); background: var(--c-surface-sunken); border: 1px solid var(--c-border); border-radius: 16px; }
    .show__h { font: 500 22px/1.2 var(--f-head); margin: 0 0 14px; }
    .show__cards { list-style: none; margin: 0 calc(var(--pad) * -1); padding: 0 var(--pad) 4px; display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: var(--pad); scrollbar-width: none; }
    .show__cards::-webkit-scrollbar { display: none; }
    .show__cards > li { flex: 0 0 78%; scroll-snap-align: start; }
    .more { margin-top: 16px; display: grid; gap: 16px; padding: 22px 20px; border-radius: 12px; color: #fff; background: linear-gradient(120deg, var(--c-dark), var(--c-dark-soft)); }
    .more__title { margin: 0 0 6px; font: 500 20px/1.25 var(--f-head); }
    .more__desc { margin: 0; font-size: 14px; opacity: .92; max-width: 60ch; }
    .more__buy { display: flex; flex-direction: column; gap: 10px; }
    .more__price { margin: 0; font: 600 19px/1.1 var(--f-ui); }
    .more__cta { background: #fff; color: #111; border-color: #fff; width: 100%; }
    .more__cta:hover { background: transparent; color: #fff; }
    .more__note { margin: 0; font-size: 13px; opacity: .88; }
    @media (min-width: 768px) {
      .show__h { font-size: 26px; margin-bottom: 16px; }
      .show { --pad: 28px; }
      .show__cards { display: grid; grid-template-columns: repeat(3, 1fr); overflow: visible; margin: 0; padding: 0; gap: 16px; }
      .show__cards > li { flex: initial; }
      .more { grid-template-columns: 1fr auto; align-items: center; gap: 40px; padding: 28px 36px; }
      .more__title { font-size: 28px; }
      .more__desc { font-size: 15px; }
      .more__price { font-size: 22px; }
      .more__note { font-size: 14px; }
      .more__buy { align-items: flex-end; text-align: right; min-width: 240px; }
      .more__cta { width: auto; min-width: 220px; }
    }
  `,
})
export class ProductShowcaseComponent {
  private products = inject(ProductStore);
  private subscriptions = inject(SubscriptionStore);
  private flow = inject(SubscriptionFlowStore);
  private now = inject(NOW);

  readonly defaultCta = DEFAULT_CTA;
  settings = input<ShowcaseSettings>({ mode: 'rotation', slideIds: [], startDate: '2000-01-01', periodDays: 1 });
  content = input<ShowcaseContent>({ slides: [] });

  slide = computed(() => pickSlide(this.settings(), this.content()?.slides ?? [], this.products.products(), this.subscriptions.subscribedIds(), this.now()));
  cards = computed(() => this.slide()?.cards.slice(0, CARDS) ?? []);
  hasCheckout = computed(() => this.products.find(this.slide()?.productId)?.flow === 'internal');

  open(productId: string) { this.flow.open(productId); }
}
