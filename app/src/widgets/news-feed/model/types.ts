import { Article } from '@entities/article';

/** Файл блока в CMS: settings (как ведёт себя) и content (что показывает). */
/** Пока настроек нет: оформление ленты (лента или столбец на мобильном) решает код по виду карточек. */
export type NewsFeedSettings = Record<string, never>;
export interface NewsFeedContent {
  items: Article[];
}
