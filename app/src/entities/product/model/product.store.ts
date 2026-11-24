import { Injectable, computed, inject, signal } from '@angular/core';
import { CmsClient } from '@shared/api';
import { Product } from './types';

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private cms = inject(CmsClient);
  readonly products = signal<Product[]>([]);
  readonly loaded = signal(false);
  readonly error = signal(false);
  private byId = computed(() => new Map(this.products().map(p => [p.id, p])));

  find(id: string | undefined | null): Product | undefined {
    return id ? this.byId().get(id) : undefined;
  }

  load(): void {
    this.cms.get<{ products: Product[] }>('products').subscribe({
      next: r => { this.products.set(r.products); this.loaded.set(true); },
      error: () => this.error.set(true),
    });
  }
}
