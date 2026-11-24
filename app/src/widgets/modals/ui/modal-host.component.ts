import { Component, computed, inject } from '@angular/core';
import { CheckoutModalComponent, PlansModalComponent, SubscriptionFlowStore, SuccessModalComponent } from '@features/subscription-flow';
import { WebinarDetailComponent, WebinarDetailsStore } from '@features/webinar-details';
import { ModalShellComponent } from '@shared/ui';

type Step = 'webinar' | 'plans' | 'checkout' | 'success';
const SIZE = { webinar: 'sm', plans: 'md', checkout: 'lg', success: 'sm' } as const;
const LABEL = { webinar: 'Вебинар', plans: 'Выбор тарифа', checkout: 'Оплата', success: 'Подписка оформлена' } as const;

/**
 * Единое окно для двух фич. Сами фичи друг о друге не знают:
 * переходы «вебинар ↔ тарифы» связывает этот виджет.
 */
@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [ModalShellComponent, PlansModalComponent, CheckoutModalComponent, SuccessModalComponent, WebinarDetailComponent],
  template: `
    @if (step(); as s) {
      <app-modal-shell [size]="size()" [label]="label()" (closed)="close()">
        @switch (s) {
          @case ('webinar') { <app-webinar-detail (subscribe)="toPlans($event)" (single)="toPlans($event)" /> }
          @case ('plans') { <app-plans-modal (backToWebinar)="backToWebinar()" /> }
          @case ('checkout') { <app-checkout-modal /> }
          @case ('success') { <app-success-modal /> }
        }
      </app-modal-shell>
    }
  `,
})
export class ModalHostComponent {
  private flow = inject(SubscriptionFlowStore);
  private details = inject(WebinarDetailsStore);

  step = computed<Step | null>(() => this.flow.state()?.step ?? (this.details.webinarId() ? 'webinar' : null));
  size = computed(() => SIZE[this.step() ?? 'plans']);
  label = computed(() => LABEL[this.step() ?? 'plans']);

  toPlans(e: { productId: string; webinarId: string; singlePlanId?: string }) {
    this.details.close();
    this.flow.open(e.productId, { webinarId: e.webinarId, singlePlanId: e.singlePlanId });
  }

  backToWebinar() {
    const id = this.flow.state()?.webinarId;
    this.flow.close();
    if (id) this.details.open(id);
  }

  close() {
    this.flow.close();
    this.details.close();
  }
}
