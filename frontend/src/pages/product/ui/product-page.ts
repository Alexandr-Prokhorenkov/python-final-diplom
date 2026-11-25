import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ProductInfo, ProductInfoApi, ProductInfoDetails } from '@entities/product-info';
import { AddToBasketButton } from '@features/add-to-basket';
import { PageHeader } from '@shared/ui';

@Component({
  selector: 'page-product',
  imports: [PageHeader, ProductInfoDetails, AddToBasketButton],
  templateUrl: './product-page.html',
  styleUrl: './product-page.scss',
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
