# Поля CMS (что настраивает редакция)

Все файлы в `app/public/cms/`. У блока один файл `blocks/<id>.json` формы `{ "settings": {…}, "content": {…} }`. Ошибка в файле одного блока скрывает только этот блок; отсутствующее поле даёт значение по умолчанию.

## layout.json: заменитель существующего конструктора
Порядок и ширину блоков на странице на проде задаёт конструктор The Bell; редакция блока «Витрина» или «Вебинары» это не настраивает. Файл нужен демо, чтобы поставить блоки на страницу.

| Поле | Что делает |
|---|---|
| `blocks[].id` | имя блока, файл `blocks/<id>.json` |
| `blocks[].type` | `news-feed`, `product-showcase`, `webinars` |
| `blocks[].enabled` | `false` — блок не показывается |
| `blocks[].span.desktop` / `mobile` | ширина в колонках (из 12 / из 4) |
Порядок в массиве = порядок на странице.

## blocks/showcase.json: витрина
| Поле | Что делает |
|---|---|
| `settings.mode` | `rotation` (по дате) или `manual` (всегда `slideId`) |
| `settings.slideIds` | порядок слайдов в ротации |
| `settings.startDate`, `periodDays` | с какой даты (UTC, `ГГГГ-ММ-ДД`) и как часто меняется слайд |
| `content.slides[].productId` | продукт: в чьи тарифы ведёт кнопка |
| `slides[].heading` | заголовок блока |
| `slides[].cards[]` (до 3) | `category`, `title`, `date`, `image`, `url` |
| `slides[].more` | широкая карточка: `title`, `text`, `price`, `cta` (кнопка по умолчанию «Выбрать тариф») |

## blocks/webinars.json: вебинары
| Поле | Что делает |
|---|---|
| `settings.title`, `limit`, `includePast` | заголовок, сколько карточек всего, показывать ли прошедшие |
| `content.webinars[]` | `id`, `title`, `speaker`, `speakerRole`, `startsAt` (с часовым поясом), `durationMin`, `productId`, `cover`, `description`, `topics`, `bio`, `eventUrl`, `recordingUrl`, `singlePlanId`, `statusOverride` (`upcoming`/`live`/`past`) |

## blocks/feed-*.json: ленты новостей
Ленты в этом задании заменяют соседние блоки сетки. Настроек нет, только содержимое.
| Поле | Что делает |
|---|---|
| `content.items[]` | `category`, `title`, `date`, `url`; есть `image` — фотокарточка, нет — текстовая |

## products.json: справочник продуктов (не блок)
Продукты, тарифы и цены для модалки; `flow: "internal"` — путь покупки в приложении, `"none"` — только карточка.
