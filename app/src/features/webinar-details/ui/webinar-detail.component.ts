import { Component, ElementRef, afterNextRender, computed, inject, output } from '@angular/core';
import { ProductStore } from '@entities/product';
import { SubscriptionStore } from '@entities/subscription';
import { STATUS_LABEL, WebinarStore, formatSpeakerRole, formatWebinarTime, webinarStatus } from '@entities/webinar';
import { NOW, formatMoney } from '@shared/lib';
import { WebinarDetailsStore } from '../model/webinar-details.store';
import { webinarCta } from '../model/webinar-cta';

@Component({
  selector: 'app-webinar-detail',
  standalone: true,
  template: `
    @if (w(); as w) {
      <article class="wd">
        <div class="wd__cover" [style.--from]="product()?.theme?.from" [style.--to]="product()?.theme?.to">
          @if (w.cover) { <img [src]="w.cover" alt="" /> }
          <span class="wd__badge" [attr.data-status]="status()">{{ statusLabel[status()] }}</span>
          <span class="wd__prod">{{ product()?.name }}</span>
        </div>
        <div class="wd__body">
          <p class="wd__when">{{ when() }}</p>
          <h2 class="wd__h" tabindex="-1" data-autofocus>{{ w.title }}</h2>
          @if (w.speaker) { <p class="wd__sp"><b>{{ w.speaker }}</b>{{ role() }}</p> }
          @if (w.host) { <p class="wd__meta">{{ w.host }}</p> }
          @if (w.format) { <p class="wd__meta">Формат: {{ w.format }}</p> }
          @if (w.description) { <p class="wd__d">{{ w.description }}</p> }
          @if (w.topics?.length) {
            <h3>О чём поговорим</h3>
            <ul>@for (t of w.topics; track t) { <li>{{ t }}</li> }</ul>
          }
          @if (w.bio) { <h3>Спикер</h3><p class="wd__d">{{ w.bio }}</p> }

          <div class="wd__act">
            @switch (cta().kind) {
              @case ('subscribe') {
                <button type="button" class="btn" [class.btn--primary]="status() !== 'past'" [class.btn--ghost]="status() === 'past'" (click)="onSubscribe()">{{ cta().label }}</button>
                @if (singlePrice(); as sp) { <button type="button" class="wd__link" (click)="onSingle()">или разовое участие за {{ sp }}</button> }
              }
              @case ('register') {
                @if (registered()) { <p class="wd__ok">Вы зарегистрированы ✓</p> }
                @else { <button type="button" class="btn btn--primary" (click)="register()">{{ cta().label }}</button> }
              }
              @case ('join') { <a class="btn btn--primary" [href]="w.eventUrl" target="_blank" rel="noopener">{{ cta().label }}</a> }
              @case ('watch') { <a class="btn btn--ghost" [href]="w.recordingUrl!" target="_blank" rel="noopener">{{ cta().label }}</a> }
              @case ('soon') { <p class="wd__soon">{{ cta().label }}</p> }
              @default { <p class="wd__soon">Оформить подписку онлайн скоро будет можно</p> }
            }
          </div>
        </div>
      </article>
    }
  `,
  styles: `
    .wd__cover { position: relative; aspect-ratio: 16 / 9; background: linear-gradient(120deg, var(--from, #313131), var(--to, #5d5d5d)); }
    .wd__cover img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 25%; }
    .wd__badge { position: absolute; left: 14px; bottom: 14px; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #fff; color: #111; }
    .wd__badge[data-status='live'] { background: var(--c-accent); color: #fff; }
    .wd__badge[data-status='upcoming'] { background: var(--c-success-bg); }
    .wd__prod { position: absolute; right: 52px; bottom: 14px; padding: 2px 8px; border-radius: 4px; background: rgba(0,0,0,.55); color: #fff; font-size: 12px; }
    .wd__body { padding: 20px 24px 28px; }
    .wd__when { margin: 0 0 6px; font-size: 14px; font-weight: 600; color: var(--c-grey-700); }
    .wd__h { margin: 0 0 12px; font: 500 26px/1.2 var(--f-head); outline: none; }
    .wd__sp, .wd__meta, .wd__d { margin: 0 0 10px; line-height: 1.45; }
    .wd__meta { font-size: 14px; color: var(--c-grey-700); }
    h3 { margin: 18px 0 8px; font-size: 16px; }
    ul { margin: 0; padding-left: 20px; display: grid; gap: 6px; }
    .wd__act { position: sticky; bottom: 0; margin: 24px -24px -28px; padding: 14px 24px; background: var(--c-bg); border-top: 1px solid var(--c-grey-200); display: flex; flex-direction: column; gap: 10px; align-items: stretch; }
    .wd__link { background: none; border: 0; padding: 0; color: var(--c-link); text-decoration: underline; font-size: 14px; }
    .wd__ok { margin: 0; color: #17782f; font-weight: 600; }
    .wd__soon { margin: 0; color: var(--c-grey-500); font-size: 14px; }
    @media (min-width: 768px) { .wd__act { flex-direction: row; align-items: center; gap: 20px; } .wd__act .btn { min-width: 260px; } }
  `,
})
export class WebinarDetailComponent {
  private details = inject(WebinarDetailsStore);
  private subscriptions = inject(SubscriptionStore);
  private webinars = inject(WebinarStore);
  private products = inject(ProductStore);
  /** открыть тарифы: переход между фичами выполняет виджет */
  subscribe = output<{ productId: string; webinarId: string }>();
  single = output<{ productId: string; webinarId: string; singlePlanId: string }>();
  private now = inject(NOW);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly statusLabel = STATUS_LABEL;
  w = computed(() => this.webinars.find(this.details.webinarId()));
  product = computed(() => this.products.find(this.w()?.productId));
  status = computed(() => { const w = this.w(); return w ? webinarStatus(w, this.now()) : 'past'; });
  cta = computed(() => webinarCta(this.w()!, this.status(), this.product(), this.subscriptions.subscribedIds()));
  registered = computed(() => this.subscriptions.registeredWebinars().has(this.w()?.id ?? ''));
  role = computed(() => formatSpeakerRole(this.w()?.speakerRole ?? null));
  singlePrice = computed(() => {
    const id = this.cta().singlePlanId;
    const pl = this.product()?.plans.find(p => p.id === id);
    return pl ? formatMoney(pl.price, pl.currency) : '';
  });

  when = computed(() => { const x = formatWebinarTime(this.w()?.startsAt ?? null, true); return x.local ? `${x.cet} · ${x.local}` : x.cet; });

  constructor() {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[data-autofocus]')?.focus());
  }

  onSubscribe() { this.subscribe.emit({ productId: this.product()!.id, webinarId: this.w()!.id }); }
  onSingle() { this.single.emit({ productId: this.product()!.id, webinarId: this.w()!.id, singlePlanId: this.cta().singlePlanId! }); }
  register() { this.subscriptions.registerWebinar(this.w()!.id); }
}
