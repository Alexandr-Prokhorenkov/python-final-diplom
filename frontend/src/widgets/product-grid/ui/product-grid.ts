import { Component, input } from '@angular/core';

import { ProductInfo, ProductInfoCard } from '@entities/product-info';
import { AddToBasketButton } from '@features/add-to-basket';
import { EmptyState } from '@shared/ui';

@Component({
  selector: 'widget-product-grid',
  imports: [ProductInfoCard, AddToBasketButton, EmptyState],
  template: `
    @if (!items().length) {
      <ui-empty-state text="Нет предложений по выбранным фильтрам" />
    } @else {
      <div class="app-grid">
        @for (item of items(); track item.id) {
          <entity-product-info-card [item]="item">
            <feature-add-to-basket [productInfoId]="item.id" [max]="item.quantity" />
          </entity-product-info-card>
        }
      </div>
    }
  `,
})
export class ProductGridWidget {
  readonly items = input.required<ProductInfo[]>();
}
