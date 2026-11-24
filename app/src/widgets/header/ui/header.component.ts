import { Component, HostListener, inject, signal } from '@angular/core';
import { SubscriptionFlowStore } from '@features/subscription-flow';

/**
 * Шапка. Десктоп: логотип, разделы, «Подписаться». Мобильный (как на thebell.io): бургер слева,
 * логотип по центру, профиль справа; под ними «Подписаться» на всю ширину.
 */
@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="hdr">
      <div class="hdr__in">
        <button type="button" class="hdr__icon hdr__burger" aria-label="Меню" aria-controls="site-menu" [attr.aria-expanded]="open()" (click)="open.set(!open())">
          <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="M3 8h18M3 16h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <a class="hdr__logo" href="#" aria-label="The Bell">THE BELL.</a>
        <nav class="hdr__nav" aria-label="Разделы">
          @for (n of nav; track n) { <a href="#">{{ n }}</a> }
        </nav>
        <div class="hdr__right">
          <a class="hdr__unl" href="#">Unlimited</a>
          <button class="btn btn--primary hdr__sub" type="button" (click)="subscribe()">Подписаться</button>
          <a class="hdr__login" href="#">Войти</a>
          <a class="hdr__icon hdr__user" href="#" aria-label="Войти">
            <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          </a>
        </div>
      </div>
      <div class="hdr__mrow"><button type="button" class="hdr__msub" (click)="subscribe()">Подписаться</button></div>
      @if (open()) {
        <nav id="site-menu" class="hdr__menu" aria-label="Меню">
          @for (n of nav; track n) { <a href="#" (click)="open.set(false)">{{ n }}</a> }
          <a href="#" (click)="open.set(false)">Unlimited</a>
          <a href="#" (click)="open.set(false)">Войти</a>
        </nav>
      }
    </header>
  `,
  styles: `
    .hdr { background: var(--c-bg-soft); }
    .hdr__in { max-width: var(--container); margin: 0 auto; padding: 8px var(--gutter) 0; display: grid; grid-template-columns: 48px 1fr 48px; align-items: center; }
    .hdr__logo { justify-self: center; font: 900 46px/1 'Sofia Sans Condensed', Impact, sans-serif; color: var(--c-brand); text-decoration: none; letter-spacing: .5px; padding: 8px 0; }
    .hdr__icon { display: grid; place-items: center; width: 48px; height: 48px; padding: 0; border: 0; background: none; color: var(--c-grey-500); }
    .hdr__user { justify-self: end; }
    .hdr__nav, .hdr__unl, .hdr__login, .hdr__sub { display: none; }
    .hdr__right { display: contents; }
    .hdr__mrow { padding: 8px var(--gutter) 16px; max-width: var(--container); margin: 0 auto; }
    .hdr__msub { width: 100%; min-height: 48px; border: 1px solid var(--c-accent); border-radius: 8px; background: #fff; color: var(--c-accent); font-size: 17px; font-weight: 500; }
    .hdr__menu { display: grid; padding: 0 var(--gutter) 16px; background: var(--c-bg-soft); border-bottom: 1px solid var(--c-grey-200); }
    .hdr__menu a { padding: 12px 0; text-decoration: none; border-top: 1px solid var(--c-grey-200); font-size: 17px; }

    @media (min-width: 768px) {
      .hdr { background: var(--c-bg); border-bottom: 1px solid var(--c-grey-200); position: sticky; top: 0; z-index: 10; }
      .hdr__in { display: flex; align-items: center; gap: 24px; height: var(--header-h); padding: 0 var(--gutter); }
      .hdr__logo { font-size: 26px; padding: 0; }
      .hdr__burger, .hdr__user, .hdr__mrow, .hdr__menu { display: none; }
      .hdr__nav { display: flex; gap: 20px; font-size: 15px; }
      .hdr__nav a, .hdr__unl, .hdr__login { text-decoration: none; }
      .hdr__right { display: flex; margin-left: auto; align-items: center; gap: 16px; font-size: 15px; }
      .hdr__sub { display: inline-block; padding: 8px 16px; min-height: 36px; font-size: 14px; }
      .hdr__login { display: inline; }
    }
    @media (min-width: 1070px) { .hdr__unl { display: inline; } }
  `,
})
export class HeaderComponent {
  private flow = inject(SubscriptionFlowStore);
  nav = ['Главное', 'Новости', 'Экономика', 'Технологии', 'Бизнес', 'Инвестиции'];
  open = signal(false);

  /** «Подписаться» ведёт к тарифам единой подписки */
  subscribe() { this.open.set(false); this.flow.open('unlimited'); }

  @HostListener('document:keydown.escape') onEsc() { this.open.set(false); }
}
