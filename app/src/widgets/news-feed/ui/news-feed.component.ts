import { Component, computed, input } from '@angular/core';
import { ArticleCardComponent } from '@entities/article';
import { NewsFeedContent, NewsFeedSettings } from '../model/types';

/** Блок-лента: карточки из content.items, поведение из settings (см. model/types.ts). */
@Component({
  selector: 'app-news-feed',
  standalone: true,
  imports: [ArticleCardComponent],
  template: `
    <ul class="feed" [class.feed--list]="mobileList()" [class.feed--panel]="!hasPhotos()">
      @for (i of items(); track i.title) {
        <li><app-article-card [item]="i" /></li>
      }
    </ul>
  `,
  styles: `
    .feed { list-style: none; margin: 0 calc(var(--gutter) * -1); padding: 0 var(--gutter) 4px; display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scroll-padding-inline: var(--gutter); scrollbar-width: none; }
    .feed::-webkit-scrollbar { display: none; }
    .feed > li { flex: 0 0 72%; scroll-snap-align: start; }
    .feed--list { display: grid; grid-template-columns: 1fr; overflow: visible; margin: 0; padding: 0; scroll-snap-type: none; }
    .feed--list > li { flex: initial; --card-min-h: 0px; }
    @media (min-width: 768px) {
      .feed, .feed--list { display: grid; grid-template-columns: repeat(2, 1fr); overflow: visible; margin: 0; padding: 0; gap: 16px; }
      .feed > li { flex: initial; }
    }
    @media (min-width: 1070px) { .feed, .feed--list { grid-template-columns: repeat(3, 1fr); gap: 24px; } }
    @media (min-width: 768px) {
      .feed--panel { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; grid-template-columns: none; gap: 40px; padding: 28px 32px; background: #fff; border: 1px solid var(--c-grey-200); border-radius: 12px; }
    }
  `,
})
export class NewsFeedComponent {
  settings = input<NewsFeedSettings>({});
  content = input<NewsFeedContent>({ items: [] });

  items = computed(() => this.content()?.items ?? []);
  /** полоса только из текстовых новостей: на широком экране это одна белая панель с колонками */
  hasPhotos = computed(() => this.items().some(i => !!i.image));
  /** на мобильном фотокарточки идут столбцом, как на thebell.io; текстовые новости листаются лентой */
  mobileList = computed(() => this.hasPhotos());
}
