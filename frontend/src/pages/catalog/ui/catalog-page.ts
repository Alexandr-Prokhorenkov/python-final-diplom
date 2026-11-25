import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ProductFilters, ProductInfo, ProductInfoApi } from '@entities/product-info';
import { PageHeader } from '@shared/ui';
import { ProductFiltersWidget } from '@widgets/product-filters';
import { ProductGridWidget } from '@widgets/product-grid';

@Component({
  selector: 'page-catalog',
  imports: [PageHeader, ProductFiltersWidget, ProductGridWidget],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
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
