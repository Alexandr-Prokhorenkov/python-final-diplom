import { Component, input } from '@angular/core';

import { ProductInfo, ProductInfoCard } from '@entities/product-info';
import { AddToBasketButton } from '@features/add-to-basket';
import { EmptyState } from '@shared/ui';

@Component({
  selector: 'widget-product-grid',
  imports: [ProductInfoCard, AddToBasketButton, EmptyState],
  templateUrl: './product-grid.html',
  styleUrl: './product-grid.scss',
})
export class ProductGridWidget {
  readonly items = input.required<ProductInfo[]>();
}
