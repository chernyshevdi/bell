import { Article } from '@entities/article';

/** Широкая карточка под тремя материалами. Все поля, кроме заголовка, необязательны. */
export interface ShowcaseMore {
  title: string;
  text?: string;
  /** например «$1 первый месяц»; нет поля: строка цены не показывается */
  price?: string;
  /** подпись кнопки, по умолчанию «Выбрать тариф» */
  cta?: string;
}

/** Один «слайд» витрины: продукт, заголовок, три материала и широкая карточка. Редактируется в CMS (blocks/showcase.json). */
export interface ShowcaseSlide {
  id: string;
  productId: string;
  heading: string;
  cards: Article[];
  more: ShowcaseMore;
}

/** settings блока: как выбирается слайд */
export interface ShowcaseSettings {
  mode: 'manual' | 'rotation';
  /** для mode = manual */
  slideId?: string;
  /** порядок слайдов в ротации */
  slideIds: string[];
  /** ISO-дата начала ротации (YYYY-MM-DD, 00:00 UTC) */
  startDate: string;
  periodDays: number;
  fallbackSlideId?: string;
}

/** content блока */
export interface ShowcaseContent {
  slides: ShowcaseSlide[];
}
