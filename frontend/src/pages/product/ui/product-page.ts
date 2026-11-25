import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ProductInfo, ProductInfoApi, ProductInfoDetails } from '@entities/product-info';
import { AddToBasketButton } from '@features/add-to-basket';
import { PageHeader } from '@shared/ui';

@Component({
  selector: 'page-product',
  imports: [PageHeader, ProductInfoDetails, AddToBasketButton],
  template: `
    <section class="app-page">
      <ui-page-header title="Предложение" />
      @if (item(); as product) {
        <entity-product-info-details [item]="product" />
        <feature-add-to-basket [productInfoId]="product.id" [max]="product.quantity" />
      }
    </section>
  `,
})
export class ProductPage {
  private readonly api = inject(ProductInfoApi);
  private readonly route = inject(ActivatedRoute);
  readonly item = signal<ProductInfo | null>(null);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      void firstValueFrom(this.api.detail(id)).then((item) => this.item.set(item));
    }
  }
}
