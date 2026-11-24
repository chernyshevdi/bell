export interface Article {
  category: string;
  title: string;
  date: string;
  /** фото-карточка, если есть; без фото карточка текстовая */
  image?: string;
  /** ссылка на материал; без неё карточка ведёт в никуда (#) */
  url?: string;
}
