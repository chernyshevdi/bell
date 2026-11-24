import { Type } from '@angular/core';
import { NewsFeedComponent } from '@widgets/news-feed';
import { ProductShowcaseComponent } from '@widgets/product-showcase';
import { WebinarsListComponent } from '@widgets/webinars-list';

/**
 * Реестр блоков: тип из layout.json → виджет.
 * Новый блок = виджет с input `config` + одна строка здесь + запись в layout.json.
 */
export const BLOCK_REGISTRY: Record<string, Type<unknown>> = {
  'news-feed': NewsFeedComponent,
  'product-showcase': ProductShowcaseComponent,
  'webinars': WebinarsListComponent,
};
