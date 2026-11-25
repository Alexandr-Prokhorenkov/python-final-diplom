import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ProductFilters, ProductInfo, ProductInfoApi } from '@entities/product-info';
import { PageHeader } from '@shared/ui';
import { ProductFiltersWidget } from '@widgets/product-filters';
import { ProductGridWidget } from '@widgets/product-grid';

@Component({
  selector: 'page-catalog',
  imports: [PageHeader, ProductFiltersWidget, ProductGridWidget],
  template: `
    <section class="app-page">
      <ui-page-header
        title="Каталог предложений"
        subtitle="Товары нескольких магазинов в одном списке"
      />
      <widget-product-filters (changed)="load($event)" />
      <widget-product-grid [items]="items()" />
    </section>
  `,
})
export class CatalogPage {
  private readonly api = inject(ProductInfoApi);
  readonly items = signal<ProductInfo[]>([]);

  constructor() {
    void this.load({});
  }

  async load(filters: ProductFilters): Promise<void> {
    this.items.set(await firstValueFrom(this.api.list(filters)));
  }
}
