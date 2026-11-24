import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, afterNextRender, computed, inject, output, signal } from '@angular/core';
import { Plan, ProductStore } from '@entities/product';
import { Currency, formatMoney } from '@shared/lib';
import { SubscriptionFlowStore } from '../model/subscription-flow.store';

@Component({
  selector: 'app-plans-modal',
  standalone: true,
  template: `
    @if (product(); as p) {
      <div class="pl" [style.--from]="p.theme?.from" [style.--to]="p.theme?.to">
        <header class="pl__head">
          @if (store.state()?.webinarId) { <button type="button" class="pl__back" (click)="backToWebinar.emit()">← К вебинару</button> }
          <h2 class="pl__title" tabindex="-1" data-autofocus>{{ p.name }}</h2>
          <div class="pl__cur" role="group" aria-label="Валюта">
            @for (c of currencies(); track c) {
              <button type="button" [class.on]="c === currency()" [attr.aria-pressed]="c === currency()" (click)="setCurrency(c)">{{ c }}</button>
            }
          </div>
        </header>

        <div class="pl__grid">
          <div class="pl__info">
            <p class="pl__tag">{{ p.tagline }}</p>
            <h3>Что входит в тариф</h3>
            <ul class="pl__ben">
              @for (b of benefits().included; track b) { <li class="ok">{{ b }}</li> }
              @for (b of benefits().excluded; track b) { <li class="no">{{ b }}</li> }
            </ul>
            @if (benefits().note) { <p class="pl__note">{{ benefits().note }}</p> }
            @if (selected()?.footnote; as f) { <p class="pl__heart">{{ f }}</p> }
          </div>

          <div class="pl__buy">
            <fieldset class="pl__plans">
              <legend class="sr">Тариф</legend>
              @for (pl of subs(); track pl.id) { <ng-container *ngTemplateOutlet="row; context: { $implicit: pl }" /> }
              @if (single(); as s) {
                <p class="pl__or">Или</p>
                <ng-container *ngTemplateOutlet="row; context: { $implicit: s }" />
              }
            </fieldset>
            <button type="button" class="btn btn--primary pl__cta" [disabled]="!selected()" (click)="next()">{{ selected()?.cta ?? 'Подписаться' }}</button>
            @if (selected()?.note; as n) { <p class="pl__small">{{ n }}</p> }
          </div>
        </div>

        @if (p.upsell; as u) {
          <aside class="pl__up">
            <div>
              <p class="pl__up-t">{{ u.title }}</p>
              <p class="pl__up-x">{{ u.text }}</p>
            </div>
            <p class="pl__up-p">{{ upsellPrice() }}</p>
            <button type="button" class="btn pl__up-b" (click)="openUnlimited()">{{ u.cta }}</button>
          </aside>
        }
      </div>
    }

    <ng-template #row let-pl>
      <label class="row" [class.row--on]="pl.id === selectedId()">
        <input type="radio" name="plan" [value]="pl.id" [checked]="pl.id === selectedId()" (change)="selectedId.set(pl.id)" />
        <span class="row__l">
          <span class="row__name">{{ pl.label }}@if (pl.badge) { <em class="row__badge">{{ pl.badge }}</em> }@if (pl.discount) { <em class="row__badge">{{ pl.discount }}</em> }</span>
          @if (pl.saving) { <span class="row__sub">{{ pl.saving }}</span> }
        </span>
        <span class="row__r">
          <span class="row__price">@if (pl.oldPrice) { <s>{{ money(pl.oldPrice, pl.currency) }}</s> } {{ money(pl.price, pl.currency) }}</span>
          @if (pl.perText) { <span class="row__sub">{{ pl.perText }}</span> }
        </span>
      </label>
    </ng-template>
  `,
  imports: [NgTemplateOutlet],
  styles: `
    .sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
    .pl { padding: 24px 20px 20px; }
    .pl__head { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; margin: 0 40px 16px 0; }
    .pl__back { background: none; border: 0; padding: 0; color: var(--c-link); font-size: 14px; flex-basis: 100%; text-align: left; }
    .pl__title { margin: 0; font: 500 28px/1.15 var(--f-head); outline: none; }
    .pl__cur { margin-left: auto; display: inline-flex; padding: 3px; border: 1px solid var(--c-grey-200); border-radius: 10px; }
    .pl__cur button { border: 0; background: none; padding: 6px 14px; border-radius: 7px; color: var(--c-grey-500); font-size: 14px; }
    .pl__cur button.on { background: var(--c-bg-soft); color: var(--c-text); font-weight: 600; }
    .pl__grid { display: grid; gap: 20px; padding: 20px; border-radius: 12px; background: var(--c-bg-soft); }
    .pl__tag { margin: 0 0 16px; color: var(--c-grey-700); }
    .pl__info h3 { margin: 0 0 10px; font-size: 16px; }
    .pl__ben { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: 15px; }
    .pl__ben li { position: relative; padding-left: 26px; }
    .pl__ben li::before { position: absolute; left: 0; top: 0; font-weight: 700; }
    .pl__ben .ok::before { content: '✓'; color: var(--c-link); }
    .pl__ben .no { color: var(--c-grey-500); }
    .pl__ben .no::before { content: '✕'; color: var(--c-grey-500); }
    .pl__note { margin: 14px 0 0; font-size: 14px; }
    .pl__heart { margin: 14px 0 0; font-size: 14px; color: var(--c-grey-700); }
    .pl__plans { border: 0; margin: 0; padding: 0; display: grid; gap: 8px; min-width: 0; }
    .row { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px; border: 1px solid var(--c-grey-200); border-radius: 10px; background: var(--c-bg); cursor: pointer; }
    .row--on { border-color: var(--c-link); box-shadow: 0 0 0 1px var(--c-link); }
    .row input { accent-color: var(--c-link); margin: 0; width: 18px; height: 18px; flex: none; }
    .row__l { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .row__r { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; text-align: right; }
    .row__name { font-size: 16px; }
    .row__badge { margin-left: 8px; font-style: normal; font-size: 12px; color: var(--c-link); }
    .row__price { font-size: 20px; font-weight: 600; }
    .row__price s { font-size: 14px; font-weight: 400; color: var(--c-grey-500); margin-right: 4px; }
    .row__sub { font-size: 12px; color: var(--c-grey-500); }
    .pl__or { margin: 4px 0 0; color: var(--c-grey-700); }
    .pl__cta { width: 100%; margin-top: 14px; font-size: 17px; background: var(--c-link); border-color: var(--c-link); }
    .pl__cta:hover:not(:disabled) { background: transparent; color: var(--c-link); }
    .pl__small { margin: 10px 0 0; font-size: 13px; color: var(--c-grey-700); }
    .pl__up { margin-top: 16px; display: grid; gap: 10px; align-items: center; padding: 16px 20px; border-radius: 12px; color: #fff; background: linear-gradient(120deg, #222, #5b6fe0); }
    .pl__up-t { margin: 0; font-weight: 600; }
    .pl__up-x { margin: 4px 0 0; font-size: 14px; opacity: .8; }
    .pl__up-p { margin: 0; font-size: 22px; font-weight: 600; }
    .pl__up-b { background: #fff; color: #111; border-color: #fff; }
    @media (min-width: 768px) {
      .pl { padding: 32px; }
      .pl__grid { grid-template-columns: 1fr 1fr; gap: 36px; padding: 28px; }
      .pl__up { grid-template-columns: 1fr auto auto; gap: 24px; }
    }
  `,
})
export class PlansModalComponent {
  store = inject(SubscriptionFlowStore);
  private products = inject(ProductStore);
  /** возврат к карточке вебинара: решает виджет, фичи друг о друге не знают */
  backToWebinar = output<void>();
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly money = formatMoney;
  product = computed(() => this.products.find(this.store.state()?.productId));
  currency = signal<Currency>(this.store.state()?.singlePlanId ? 'RUB' : 'USD');
  selectedId = signal<string | null>(null);

  currencies = computed(() => [...new Set(this.product()?.plans.map(p => p.currency) ?? [])] as Currency[]);
  private inCurrency = computed(() => (this.product()?.plans ?? []).filter(p => p.currency === this.currency()));
  subs = computed(() => this.inCurrency().filter(p => p.period !== 'single'));
  single = computed(() => this.inCurrency().find(p => p.period === 'single') ?? null);
  selected = computed<Plan | null>(() => this.inCurrency().find(p => p.id === this.selectedId()) ?? null);

  benefits = computed(() => {
    const p = this.product();
    const sel = this.selected();
    if (!p) return { included: [] as string[], excluded: [] as string[], note: '' };
    if (sel?.period === 'trial' && p.trial?.trialBenefits) return { ...p.trial.trialBenefits };
    if (sel?.benefits) return { included: sel.benefits, excluded: [], note: '' };
    return { included: p.benefits, excluded: [], note: '' };
  });
  upsellPrice = computed(() => this.product()?.upsell?.price ?? '');

  constructor() {
    this.selectedId.set(this.defaultId());
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[data-autofocus]')?.focus());
  }

  private defaultId(): string | null {
    const wanted = this.store.state()?.singlePlanId;
    const list = this.inCurrency();
    return (wanted && list.find(p => p.id === wanted)?.id) || list.find(p => p.default)?.id || list[0]?.id || null;
  }

  setCurrency(c: Currency) {
    this.currency.set(c);
    this.selectedId.set(this.defaultId());
  }

  next() { const id = this.selectedId(); if (id) this.store.goCheckout(id); }
  openUnlimited() { this.store.open(this.product()!.upsell!.productId); }
}
