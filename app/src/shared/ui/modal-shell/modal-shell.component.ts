import { AfterViewInit, Component, ElementRef, OnDestroy, input, output, viewChild } from '@angular/core';

/**
 * Обёртка модального окна на нативном <dialog>: фокус-трап, Esc, inert-фон и возврат фокуса
 * даёт браузер. На мобильном окно становится bottom sheet.
 */
@Component({
  selector: 'app-modal-shell',
  standalone: true,
  template: `
    <dialog #dlg class="dlg" [class]="'dlg dlg--' + size()" [attr.aria-label]="label()" (cancel)="onCancel($event)" (click)="onBackdrop($event)">
      <button type="button" class="dlg__x" aria-label="Закрыть" (click)="closed.emit()">
        <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
      </button>
      <div class="dlg__in"><ng-content /></div>
    </dialog>
  `,
  styles: `
    .dlg { border: 0; padding: 0; background: var(--c-bg); color: var(--c-text); width: 100%; max-width: 100%; max-height: 94dvh; margin: auto 0 0; border-radius: 16px 16px 0 0; overflow: auto; overscroll-behavior: contain; animation: up .25s ease-out; }
    .dlg::backdrop { background: rgba(20, 20, 20, .6); }
    .dlg__in { min-height: 0; }
    .dlg__x { position: absolute; top: 12px; right: 12px; z-index: 2; width: 32px; height: 32px; display: grid; place-items: center; border: 0; border-radius: 50%; background: rgba(255,255,255,.92); color: #111; box-shadow: 0 1px 4px rgba(0,0,0,.2); }
    .dlg__x:hover { background: #fff; }
    @keyframes up { from { transform: translateY(24px); opacity: 0; } }
    @media (min-width: 768px) {
      .dlg { margin: auto; border-radius: 14px; width: calc(100% - 48px); max-height: calc(100dvh - 48px); animation: fade .2s ease-out; }
      .dlg--sm { max-width: 560px; }
      .dlg--md { max-width: 880px; }
      .dlg--lg { max-width: 1040px; }
      @keyframes fade { from { opacity: 0; transform: scale(.98); } }
    }
  `,
})
export class ModalShellComponent implements AfterViewInit, OnDestroy {
  size = input<'sm' | 'md' | 'lg'>('md');
  label = input('Окно');
  closed = output<void>();
  private dlg = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');
  private opener: HTMLElement | null = null;

  ngAfterViewInit(): void {
    this.opener = document.activeElement as HTMLElement | null;
    this.dlg().nativeElement.showModal();
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    const d = this.dlg().nativeElement;
    if (d.open) d.close();
    document.body.style.overflow = '';
    if (this.opener?.isConnected) this.opener.focus(); // нативный возврат фокуса не срабатывает, когда <dialog> убирается из DOM
  }

  onCancel(e: Event): void {
    e.preventDefault(); // закрываем через состояние, а не напрямую
    this.closed.emit();
  }

  onBackdrop(e: MouseEvent): void {
    if (e.target === this.dlg().nativeElement) this.closed.emit();
  }
}
