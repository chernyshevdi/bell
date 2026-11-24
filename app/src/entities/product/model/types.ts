import { Currency } from '@shared/lib';

export type PlanPeriod = 'trial' | 'month' | 'half' | 'year' | 'single';
/** internal: полный путь оплаты в приложении; none: только карточка без оплаты */
export type ProductFlow = 'internal' | 'none';

export interface Plan {
  id: string;
  currency: Currency;
  period: PlanPeriod;
  months?: number;
  price: number;
  thenPrice?: number;
  oldPrice?: number;
  discount?: string;
  label: string;
  badge?: string;
  perText?: string;
  saving?: string;
  separateText?: string;
  note?: string;
  cta?: string;
  default?: boolean;
  forWebinarId?: string;
  benefits?: string[];
  footnote?: string;
}

export interface Product {
  id: string;
  name: string;
  active: boolean;
  tagline: string;
  description: string;
  benefits: string[];
  fromPrice: string | null;
  /** подпись кнопки в витрине; по умолчанию «Выбрать тариф» */
  cta?: string;
  flow: ProductFlow;
  theme?: { from: string; to: string };
  plans: Plan[];
  trial?: { text: string; trialBenefits?: { included: string[]; excluded: string[]; note: string } } | null;
  upsell?: { productId: string; title: string; text: string; price: string; cta: string; link: string };
}
