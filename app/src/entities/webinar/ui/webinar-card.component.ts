import { Component, computed, input, output } from '@angular/core';
import { formatSpeakerRole, formatWebinarTime } from '../lib/webinar-time';
import { STATUS_LABEL } from '../model/webinar-status';
import { Webinar, WebinarStatus } from '../model/types';

/** Квадратная карточка вебинара: фото на всю карточку, плашки сверху, текст снизу. Клик отдаёт решение подключившему. */
@Component({
  selector: 'app-webinar-card',
  standalone: true,
  template: `
    <button type="button" class="wcard" [class.wcard--past]="status() === 'past'" [attr.data-status]="status()" [attr.data-webinar]="webinar().id"
            (click)="selected.emit()">
      <span class="wcard__media" [style.--from]="from()" [style.--to]="to()" aria-hidden="true">
        @if (webinar().cover) { <img [src]="webinar().cover" alt="" loading="lazy" decoding="async" /> }
      </span>
      <span class="wcard__chips">
        <span class="wcard__chip wcard__chip--{{ status() }}">{{ statusLabel[status()] }}</span>
        <span class="wcard__chip wcard__chip--prod">{{ productName() }}</span>
      </span>
      <span class="wcard__text">
        <time class="wcard__when" [attr.datetime]="webinar().startsAt">{{ time().cet }}@if (time().local) { <span> · {{ time().local }}</span> }</time>
        <span class="wcard__title">{{ webinar().title }}</span>
        @if (webinar().speaker) { <span class="wcard__speaker"><b>{{ webinar().speaker }}</b>{{ role() }}</span> }
      </span>
    </button>
  `,
  styles: `
    :host { display: block; width: 100%; }
    .wcard { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; padding: 0; border: 0; border-radius: 12px; overflow: hidden; text-align: left; font: inherit; color: #fff; background: #222; cursor: pointer; isolation: isolate; transition: transform .2s ease, box-shadow .2s ease; }
    .wcard:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(0,0,0,.18); }
    .wcard__media { position: absolute; inset: 0; z-index: -2; background: linear-gradient(135deg, var(--from), var(--to)); }
    .wcard--past .wcard__media { filter: saturate(.55); }
    .wcard__media img { width: 100%; height: 100%; object-fit: cover; object-position: center 25%; display: block; }
    .wcard::after { content: ''; position: absolute; inset: 0; z-index: -1; background: linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.62) 38%, rgba(0,0,0,0) 72%); }
    .wcard__chips { position: absolute; top: 12px; left: 12px; right: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
    .wcard__chip { padding: 5px 11px; border-radius: 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .2px; background: #fff; color: #111; }
    .wcard__chip--live { background: var(--c-accent); color: #fff; }
    .wcard__chip--upcoming { background: var(--c-success-bg); }
    .wcard__chip--past { background: rgba(255,255,255,.88); color: var(--c-grey-700); }
    .wcard__chip--prod { background: rgba(0,0,0,.55); color: #fff; backdrop-filter: blur(4px); }
    .wcard__text { position: absolute; left: 0; right: 0; bottom: 0; padding: 16px; display: flex; flex-direction: column; gap: 6px; }
    .wcard__when { font-size: 13px; font-weight: 600; opacity: .9; }
    .wcard__when span { font-weight: 400; opacity: .8; }
    .wcard__title { font: 500 21px/1.2 var(--f-head); display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
    .wcard__speaker { font-size: 13px; opacity: .9; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    @media (max-width: 767px) { .wcard__title { font-size: 18px; -webkit-line-clamp: 3; } .wcard__speaker { -webkit-line-clamp: 1; } .wcard__text { padding: 14px; } }
    @media (min-width: 768px) and (max-width: 1069px) { .wcard__title { font-size: 17px; } .wcard__text { padding: 12px; } }
  `,
})
export class WebinarCardComponent {
  webinar = input.required<Webinar>();
  status = input.required<WebinarStatus>();
  productName = input('');
  theme = input<{ from: string; to: string } | undefined>(undefined);
  selected = output<void>();

  readonly statusLabel = STATUS_LABEL;
  from = computed(() => this.theme()?.from ?? 'var(--c-dark)');
  to = computed(() => this.theme()?.to ?? 'var(--c-dark-2)');
  time = computed(() => formatWebinarTime(this.webinar().startsAt));
  role = computed(() => formatSpeakerRole(this.webinar().speakerRole));
}
