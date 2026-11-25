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
  templateUrl: './basket-panel.html',
  styleUrl: './basket-panel.scss',
})
export class BasketPanelWidget {
  private readonly store = inject(BasketStore);
  readonly basket = this.store.basket;
  readonly paths = paths;
  readonly money = formatMoney;
}
