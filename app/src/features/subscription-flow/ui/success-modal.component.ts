import { Component, ElementRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { ProductStore } from '@entities/product';
import { WebinarStore } from '@entities/webinar';
import { SubscriptionFlowStore } from '../model/subscription-flow.store';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  template: `
    @if (product(); as p) {
      <div class="ok">
        <h2 class="ok__h" tabindex="-1" data-autofocus>{{ single() ? 'Вы зарегистрированы!' : 'Подписка оплачена!' }}</h2>

        @if (single()) {
          <p>Вы оформили разовое участие в вебинаре «{{ webinarTitle() }}».</p>
          <p>Ссылку на трансляцию и запись мы отправим на <b>{{ email() }}</b>.</p>
          <div class="ok__foot"><span></span><button type="button" class="btn btn--primary" (click)="store.close()">Понятно</button></div>
        } @else if (page() === 1) {
          <p>Вы успешно оформили подписку <b>{{ p.name }}</b>.<br />Совсем скоро письма начнут приходить на <b>{{ email() }}</b>.</p>
          <p>Чтобы активировать рассылки, пожалуйста, найдите письмо от The Bell и перейдите по ссылке из него.</p>
          <div class="ok__banner" [style.--from]="p.theme?.from" [style.--to]="p.theme?.to" aria-hidden="true">
            <span>THE BELL.</span><strong>{{ p.name.replace('The Bell.', '') }}</strong>
          </div>
          <div class="ok__foot"><span class="ok__pg">1/2</span><button type="button" class="btn btn--primary" (click)="page.set(2)">Дальше</button></div>
        } @else {
          <p><b>Чтобы активировать рассылки:</b></p>
          <ol class="ok__steps">
            <li><span>1.</span> Найдите письмо от The Bell с доступом</li>
            <li class="ok__arrow" aria-hidden="true">↓</li>
            <li><span>2.</span> Подтвердите почту по ссылке из письма</li>
          </ol>
          <p><b>Готово! Спасибо, что оформили подписку.</b></p>
          <div class="ok__foot">
            <button type="button" class="ok__back" (click)="page.set(1)">Назад</button>
            <span class="ok__pg">2/2</span>
            <button type="button" class="btn btn--primary" (click)="store.close()">Понятно</button>
          </div>
        }
      </div>
    }
  `,
  styles: `
    .ok { padding: 28px 24px 24px; }
    .ok__h { margin: 0 40px 16px 0; font-size: 28px; font-weight: 700; outline: none; }
    p { margin: 0 0 16px; line-height: 1.4; }
    .ok__banner { margin: 4px 0 20px; aspect-ratio: 2 / 1; border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 6px; color: #fff; background: radial-gradient(circle at 50% 120%, #fff3, transparent 60%), linear-gradient(160deg, var(--from), var(--to)); }
    .ok__banner span { font: 900 18px/1 'Sofia Sans Condensed', Impact, sans-serif; letter-spacing: .5px; }
    .ok__banner strong { font: 600 clamp(32px, 7vw, 52px)/1 var(--f-ui); }
    .ok__steps { list-style: none; margin: 0 0 20px; padding: 0; display: grid; gap: 4px; text-align: center; }
    .ok__steps li:not(.ok__arrow) { padding: 12px; background: #f1f1f1; border: 1px solid var(--c-grey-200); border-radius: 6px; }
    .ok__steps span { color: var(--c-accent); }
    .ok__foot { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
    .ok__pg { color: var(--c-grey-500); }
    .ok__back { background: none; border: 0; font-size: 15px; }
  `,
})
export class SuccessModalComponent {
  store = inject(SubscriptionFlowStore);
  private products = inject(ProductStore);
  private webinars = inject(WebinarStore);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  page = signal<1 | 2>(1);
  product = computed(() => this.products.find(this.store.state()?.productId));
  single = computed(() => this.product()?.plans.find(p => p.id === this.store.state()?.planId)?.period === 'single');
  email = computed(() => this.store.state()?.email ?? '');
  webinarTitle = computed(() => this.webinars.find(this.store.state()?.webinarId)?.title ?? '');

  constructor() {
    afterNextRender(() => this.host.nativeElement.querySelector<HTMLElement>('[data-autofocus]')?.focus());
  }
}
