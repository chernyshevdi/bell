import { Injectable, inject, signal } from '@angular/core';
import { SubscriptionStore } from '@entities/subscription';

export type FlowStep = 'plans' | 'checkout' | 'success';
export interface FlowState {
  step: FlowStep;
  productId: string;
  planId?: string;
  /** вебинар, с которого пришли: нужен для «разового участия» и возврата */
  webinarId?: string;
  singlePlanId?: string;
  email?: string;
}

/** Путь покупки: тарифы → оплата → успех. */
@Injectable({ providedIn: 'root' })
export class SubscriptionFlowStore {
  private subscriptions = inject(SubscriptionStore);
  readonly state = signal<FlowState | null>(null);

  open(productId: string, opts: { webinarId?: string; singlePlanId?: string } = {}): void {
    this.state.set({ step: 'plans', productId, ...opts });
  }

  goCheckout(planId: string): void {
    this.state.update(s => (s ? { ...s, step: 'checkout', planId } : s));
  }

  backToPlans(): void {
    this.state.update(s => (s ? { ...s, step: 'plans' } : s));
  }

  /** Оплата прошла: фиксируем доступ и показываем экран успеха. */
  complete(email: string, isSingle: boolean): void {
    const s = this.state();
    if (!s) return;
    if (isSingle && s.webinarId) this.subscriptions.registerWebinar(s.webinarId);
    else this.subscriptions.addSubscription(s.productId);
    this.state.set({ ...s, step: 'success', email });
  }

  close(): void {
    this.state.set(null);
  }
}
