import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { BasketStore } from '@entities/basket';
import { RemoveBasketItem } from '@features/remove-basket-item';
import { UpdateBasketItem } from '@features/update-basket-item';
import { formatMoney } from '@shared/lib';
import { paths } from '@shared/routes';
import { EmptyState } from '@shared/ui';

@Component({
  selector: 'widget-basket-panel',
  imports: [TableModule, Button, RouterLink, UpdateBasketItem, RemoveBasketItem, EmptyState],
  template: `
    @if (!basket() || !basket()!.ordered_items.length) {
      <ui-empty-state text="Корзина пуста" />
    } @else {
      <p-table [value]="basket()!.ordered_items">
        <ng-template #header>
          <tr>
            <th>Товар</th>
            <th>Магазин</th>
            <th>Цена</th>
            <th>Кол-во</th>
            <th>Сумма</th>
            <th></th>
          </tr>
        </ng-template>
        <ng-template #body let-item>
          <tr>
            <td>{{ item.product_info.product.name }}</td>
            <td>{{ item.product_info.shop.name }}</td>
            <td>{{ money(item.price) }}</td>
            <td>
              <feature-update-basket-item [itemId]="item.id" [quantity]="item.quantity" />
            </td>
            <td>{{ money(item.price * item.quantity) }}</td>
            <td>
              <feature-remove-basket-item [itemId]="item.id" />
            </td>
          </tr>
        </ng-template>
      </p-table>
      <div class="app-row" style="justify-content:space-between">
        <strong>Итого: {{ money(basket()!.total_sum) }}</strong>
        <p-button label="Оформить заказ" [routerLink]="paths.checkout" />
      </div>
    }
  `,
})
export class BasketPanelWidget {
  private readonly store = inject(BasketStore);
  readonly basket = this.store.basket;
  readonly paths = paths;
  readonly money = formatMoney;
}
