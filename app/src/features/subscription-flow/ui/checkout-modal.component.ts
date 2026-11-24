import { Component, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { ProductStore } from '@entities/product';
import { WebinarStore } from '@entities/webinar';
import { OFFER_URL, PRIVACY_URL } from '@shared/config';
import { NOW, addMonths, cvcValid, emailValid, expiryValid, formatCardNumber, formatDate, formatExpiry, formatMoney, luhn } from '@shared/lib';
import { TEST_CARD_DECLINE, TEST_CARD_OK, charge } from '../api/charge';
import { SubscriptionFlowStore } from '../model/subscription-flow.store';

type Field = 'email' | 'card' | 'expiry' | 'cvc' | 'terms';

@Component({
  selector: 'app-checkout-modal',
  standalone: true,
  template: `
    @if (product(); as p) { @if (plan(); as pl) {
      <div class="co">
        <aside class="co__sum">
          <p class="co__logo">THE BELL.</p>
          <div class="co__row"><h2 class="co__h" tabindex="-1" data-autofocus>Ваша подписка</h2><span class="co__cancel">✓ Отмените в любое время</span></div>
          <div class="co__plan" [style.--from]="p.theme?.from" [style.--to]="p.theme?.to">
            <div>
              <p class="co__pn">{{ isSingle() ? 'Разовое участие' : 'Подписка ' + p.name }}</p>
              <p class="co__pd">{{ isSingle() ? webinarTitle() : pl.label + ' тариф' + (pl.period === 'trial' ? ', 1 месяц' : '') }}</p>
            </div>
          </div>
          @if (pl.period === 'trial') { <p class="co__then">{{ money(pl.price, pl.currency) }} сейчас, затем {{ money(pl.thenPrice!, pl.currency) }}/месяц</p> }
          <h3 class="co__in">Входит в {{ isSingle() ? 'участие' : 'подписку' }}</h3>
          <ul class="co__ben">@for (b of included(); track b) { <li>{{ b }}</li> }</ul>
          @if (pl.period === 'trial') { <p class="co__fine">Вы оформляете пробный тариф. Участие в вебинарах и полный архив будут доступны со 2-го месяца подписки.</p> }
          <div class="co__total">
            <div><p class="co__tl">К оплате:</p><p class="co__cur">Валюта оплаты: <b>{{ pl.currency }}</b></p></div>
            <p class="co__sum-p">@if (pl.oldPrice) { <s>{{ money(pl.oldPrice, pl.currency) }}</s> } {{ money(pl.price, pl.currency) }}</p>
          </div>
          @if (renewal(); as r) { <p class="co__fine">{{ r }}</p> }
        </aside>

        <form class="co__form" novalidate (submit)="submit($event)">
          <button type="button" class="co__back" (click)="store.backToPlans()">← Тарифы</button>
          <h3 class="co__fh">Способ оплаты</h3>

          <div class="f">
            <label for="em">Введите email</label>
            <input id="em" type="email" inputmode="email" autocomplete="email" placeholder="Email" [value]="email()" (input)="email.set(val($event))" (blur)="touch('email')" [attr.aria-invalid]="bad('email')" aria-describedby="e-em" />
            @if (bad('email')) { <p id="e-em" class="f__err">Введите корректный email</p> }
          </div>

          <div class="f">
            <label for="cn">Введите данные карты</label>
            <input id="cn" inputmode="numeric" autocomplete="cc-number" placeholder="Номер карты" [value]="card()" (input)="card.set(fmtCard($event))" (blur)="touch('card')" [attr.aria-invalid]="bad('card')" aria-describedby="e-cn" />
            @if (bad('card')) { <p id="e-cn" class="f__err">Проверьте номер карты</p> }
            <div class="f__two">
              <div>
                <input inputmode="numeric" autocomplete="cc-exp" placeholder="ММ / ГГ" aria-label="Срок действия" [value]="expiry()" (input)="expiry.set(fmtExp($event))" (blur)="touch('expiry')" [attr.aria-invalid]="bad('expiry')" />
                @if (bad('expiry')) { <p class="f__err">Срок не подходит</p> }
              </div>
              <div>
                <input inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" aria-label="CVC" maxlength="4" [value]="cvc()" (input)="cvc.set(digitsOnly($event))" (blur)="touch('cvc')" [attr.aria-invalid]="bad('cvc')" />
                @if (bad('cvc')) { <p class="f__err">3–4 цифры</p> }
              </div>
            </div>
          </div>

          <label class="chk">
            <input type="checkbox" [checked]="terms()" (change)="terms.set(chk($event)); touch('terms')" />
            <span>Я принимаю <a [href]="offer" target="_blank" rel="noopener">оферту</a> и соглашаюсь с <a [href]="privacy" target="_blank" rel="noopener">политикой конфиденциальности</a>{{ renewal() && !isSingle() ? ', включая автопродление' : '' }}</span>
          </label>
          @if (bad('terms')) { <p class="f__err">Нужно ваше согласие</p> }

          @if (error()) { <p class="co__fail" role="alert">{{ error() }}</p> }

          <button type="submit" class="btn btn--primary co__pay" [disabled]="busy()">
            @if (busy()) { Обрабатываем платёж… } @else { Оплатить {{ money(pl.price, pl.currency) }} }
          </button>
          <p class="co__secure">🔒 Безопасный платёж</p>

          <p class="co__test"><b>Тестовый режим, реальные деньги не списываются.</b> Успех: {{ okCard }} · отказ: {{ declineCard }}, срок любой будущий, CVC любой.
            <button type="button" (click)="fill()">Подставить тестовую карту</button></p>
        </form>
      </div>
    } }
  `,
  styles: `
    .co { display: flex; flex-direction: column; }
    .co__sum { background: var(--c-dark); color: #fff; padding: 24px 20px; }
    .co__logo { margin: 0 40px 20px 0; font: 900 26px/1 'Sofia Sans Condensed', Impact, sans-serif; color: var(--c-brand); }
    .co__row { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
    .co__h { margin: 0; font-size: 18px; font-weight: 600; outline: none; }
    .co__cancel { font-size: 12px; opacity: .8; }
    .co__plan { border: 1px solid var(--c-accent); border-radius: 10px; background: var(--c-grey-700); padding: 14px; display: flex; justify-content: space-between; gap: 12px; }
    .co__pn { margin: 0 0 4px; font-weight: 600; }
    .co__pd { margin: 0; font-size: 14px; opacity: .9; }
    .co__then { margin: 10px 0 0; font-size: 14px; color: var(--c-grey-300); }
    .co__in { margin: 24px 0 12px; font-size: 17px; }
    .co__ben { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; font-size: 14px; }
    .co__ben li { position: relative; padding-left: 28px; }
    .co__ben li::before { content: '✓'; position: absolute; left: 0; top: -1px; width: 20px; height: 20px; border: 1.5px solid #fff; border-radius: 50%; display: grid; place-items: center; font-size: 11px; }
    .co__fine { margin: 16px 0 0; font-size: 13px; color: var(--c-grey-300); }
    .co__total { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--c-grey-700); }
    .co__tl { margin: 0 0 8px; font-weight: 600; font-size: 17px; }
    .co__cur { margin: 0; font-size: 13px; }
    .co__sum-p { margin: 0; font-size: 30px; font-weight: 600; line-height: 1; }
    .co__sum-p s { font-size: 20px; color: var(--c-grey-700); margin-right: 6px; }
    .co__form { background: var(--c-bg-soft); padding: 24px 20px 28px; display: flex; flex-direction: column; gap: 18px; }
    .co__back { align-self: flex-start; background: none; border: 0; padding: 0; color: var(--c-link); font-size: 14px; }
    .co__fh { margin: 0; font-size: 24px; font-weight: 600; }
    .f { display: flex; flex-direction: column; gap: 8px; }
    .f label { font-size: 14px; }
    .f input { width: 100%; font: inherit; font-size: 16px; padding: 14px; border: 1px solid var(--c-grey-300); border-radius: 10px; background: transparent; }
    .f input:focus-visible { outline: none; border-color: var(--c-dark); }
    .f input[aria-invalid='true'] { border-color: var(--c-accent); }
    .f__two { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .f__err { margin: 4px 0 0; font-size: 12px; color: var(--c-accent); }
    .chk { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; color: var(--c-grey-700); line-height: 1.4; }
    .chk input { margin-top: 2px; width: 18px; height: 18px; flex: none; accent-color: var(--c-accent); }
    .co__fail { margin: 0; padding: 12px 14px; border: 1px solid var(--c-accent); border-radius: 8px; background: #fff1ef; color: #9f1d10; font-size: 14px; }
    .co__pay { width: 100%; font-size: 17px; padding: 15px; }
    .co__pay:disabled { opacity: .7; cursor: progress; }
    .co__secure { margin: 0; text-align: center; font-size: 14px; }
    .co__test { margin: 0; padding: 10px 12px; border: 1px dashed var(--c-grey-300); border-radius: 8px; font-size: 12px; color: var(--c-grey-700); }
    .co__test button { background: none; border: 0; padding: 0; color: var(--c-link); text-decoration: underline; font-size: 12px; }
    @media (min-width: 900px) {
      .co { flex-direction: row; min-height: 600px; }
      .co__sum, .co__form { flex: 1; padding: 40px; }
      .co__form { justify-content: center; }
    }
  `,
})
export class CheckoutModalComponent {
  store = inject(SubscriptionFlowStore);
  private products = inject(ProductStore);
  private webinars = inject(WebinarStore);
  private now = inject(NOW);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly money = formatMoney;
  readonly offer = OFFER_URL;
  readonly privacy = PRIVACY_URL;
  readonly okCard = formatCardNumber(TEST_CARD_OK);
  readonly declineCard = formatCardNumber(TEST_CARD_DECLINE);

  email = signal('');
  card = signal('');
  expiry = signal('');
  cvc = signal('');
  terms = signal(false);
  busy = signal(false);
  error = signal('');
  private touched = signal<ReadonlySet<Field>>(new Set());
  private submitted = signal(false);

  product = computed(() => this.products.find(this.store.state()?.productId));
  plan = computed(() => this.product()?.plans.find(p => p.id === this.store.state()?.planId));
  isSingle = computed(() => this.plan()?.period === 'single');
  webinarTitle = computed(() => this.webinars.find(this.store.state()?.webinarId)?.title ?? '');

  included = computed(() => {
    const p = this.product(); const pl = this.plan();
    if (!p || !pl) return [];
    if (pl.period === 'trial' && p.trial?.trialBenefits) return p.trial.trialBenefits.included;
    if (pl.period === 'single') return ['Участие в вебинаре и запись', ...(pl.note ? [pl.note] : [])];
    return pl.benefits ?? p.benefits;
  });

  renewal = computed(() => {
    const pl = this.plan();
    if (!pl || pl.period === 'single') return '';
    const next = formatDate(addMonths(this.now(), pl.months ?? 1));
    return pl.period === 'trial'
      ? `Следующее списание ${next}: ${formatMoney(pl.thenPrice!, pl.currency)}. Отмена в любой момент в личном кабинете.`
      : `Следующее списание ${next}: ${formatMoney(pl.price, pl.currency)}. Отмена в любой момент в личном кабинете.`;
  });

  private valid = computed<Record<Field, boolean>>(() => ({
    email: emailValid(this.email()),
    card: luhn(this.card()),
    expiry: expiryValid(this.expiry(), this.now()),
    cvc: cvcValid(this.cvc()),
    terms: this.terms(),
  }));

  constructor() {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[data-autofocus]')?.focus());
  }

  bad(f: Field): boolean | null {
    return (this.touched().has(f) || this.submitted()) && !this.valid()[f] ? true : null;
  }
  touch(f: Field) { this.touched.update(s => new Set(s).add(f)); }
  val(e: Event) { return (e.target as HTMLInputElement).value; }
  chk(e: Event) { return (e.target as HTMLInputElement).checked; }
  digitsOnly(e: Event) { const i = e.target as HTMLInputElement; i.value = i.value.replace(/\D/g, ''); return i.value; }
  fmtCard(e: Event) { const i = e.target as HTMLInputElement; i.value = formatCardNumber(i.value); return i.value; }
  fmtExp(e: Event) { const i = e.target as HTMLInputElement; i.value = formatExpiry(i.value); return i.value; }

  fill() {
    this.card.set(this.okCard); this.expiry.set('12 / 30'); this.cvc.set('123');
    if (!this.email()) this.email.set('test@example.com');
    this.terms.set(true);
  }

  async submit(e: Event) {
    e.preventDefault();
    if (this.busy()) return;
    this.submitted.set(true);
    this.error.set('');
    const v = this.valid();
    const firstBad = (['email', 'card', 'expiry', 'cvc', 'terms'] as Field[]).find(f => !v[f]);
    if (firstBad) {
      const sel = { email: '#em', card: '#cn', expiry: '[autocomplete=cc-exp]', cvc: '[autocomplete=cc-csc]', terms: '.chk input' }[firstBad];
      this.host.nativeElement.querySelector<HTMLElement>(sel)?.focus();
      return;
    }
    this.busy.set(true);
    const res = await charge(this.card());
    this.busy.set(false);
    if (res.ok) {
      // данные карты не храним и не передаём дальше
      this.card.set(''); this.cvc.set(''); this.expiry.set('');
      this.store.complete(this.email().trim(), this.isSingle());
    } else {
      this.error.set(res.reason);
    }
  }
}
