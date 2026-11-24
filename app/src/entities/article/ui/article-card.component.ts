import { Component, input } from '@angular/core';
import { Article } from '../model/types';

/**
 * Карточка статьи. С фото: фото на всю карточку, рубрика плашкой, заголовок снизу (как на thebell.io).
 * Без фото: белая карточка, заголовок сверху, рубрика и дата внизу. Кликабельна вся карточка.
 */
@Component({
  selector: 'app-article-card',
  standalone: true,
  host: { '[class.photo]': '!!item().image' },
  template: `
    @if (item().image; as src) {
      <img class="card__img" [src]="src" alt="" [attr.loading]="eager() ? 'eager' : 'lazy'" [attr.fetchpriority]="eager() ? 'high' : null" decoding="async" />
      <span class="card__chip">{{ item().category }}</span>
      <a class="card__title" [href]="item().url ?? '#'" [attr.target]="item().url ? '_blank' : null" [attr.rel]="item().url ? 'noopener' : null">{{ item().title }}</a>
      <time class="card__sr">{{ item().date }}</time>
    } @else {
      <a class="card__title" [href]="item().url ?? '#'" [attr.target]="item().url ? '_blank' : null" [attr.rel]="item().url ? 'noopener' : null">{{ item().title }}</a>
      <time class="card__date">{{ item().date }}</time>
    }
  `,
  styles: `
    :host { position: relative; display: flex; flex-direction: column; justify-content: space-between; gap: 16px; min-height: var(--card-min-h, 170px); }
    :host(.photo) { padding: 0; border: 0; border-radius: 12px; overflow: hidden; isolation: isolate; aspect-ratio: 5 / 4; justify-content: flex-end; color: #fff; background: #222; }
    .card__title { font: 500 22px/1.25 var(--f-ui); text-decoration: none; }
    .card__title:hover { text-decoration: underline; }
    /* вся карточка — одна ссылка */
    .card__title::after { content: ''; position: absolute; inset: 0; }
    .card__title:focus-visible { outline: none; }
    :host(:focus-within) { outline: 2px solid var(--c-dark); outline-offset: 2px; }
    .card__date { font-size: 12px; color: var(--c-grey-500); text-transform: uppercase; letter-spacing: .3px; }

    /* фото-карточка */
    .card__img { position: absolute; inset: 0; z-index: -2; width: 100%; height: 100%; object-fit: cover; }
    :host(.photo)::after { content: ''; position: absolute; inset: 0; z-index: -1; background: linear-gradient(to top, rgba(0,0,0,.85) 0%, rgba(0,0,0,.55) 40%, rgba(0,0,0,0) 72%); pointer-events: none; }
    .card__chip { position: absolute; top: 14px; left: 14px; padding: 6px 12px; border-radius: 10px; background: #fff; color: #111; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: .2px; }
    :host(.photo) .card__title { margin: 20px; font: 500 22px/1.2 var(--f-head); color: #fff; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
    .card__sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }

    /* мобильный, как на thebell.io */
    @media (max-width: 767px) {
      :host(:not(.photo)) { height: 100%; min-height: var(--card-min-h, 210px); padding: 18px 16px 16px; background: #fff; border: 1px solid var(--c-grey-200); border-radius: 12px; }
      :host(:not(.photo)) .card__title { font: 500 19px/1.25 var(--f-ui); }
      :host(.photo) .card__title { font: 500 17px/1.25 var(--f-ui); margin: 16px; }
    }
  `,
})
export class ArticleCardComponent {
  item = input.required<Article>();
  /** первая картинка у верхнего края экрана: грузим сразу (иначе страдает LCP) */
  eager = input(false);
}
