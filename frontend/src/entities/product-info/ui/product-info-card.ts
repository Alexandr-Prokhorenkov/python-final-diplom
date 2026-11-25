import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';

import { formatMoney } from '@shared/lib';
import { paths } from '@shared/routes';

import { ProductInfo } from '../model/types';

@Component({
  selector: 'entity-product-info-card',
  imports: [Card, Tag, RouterLink],
  template: `
    <p-card>
      <ng-template #title>
        <a [routerLink]="paths.product(item().id)" style="text-decoration:none">
          {{ item().product.name }}
        </a>
      </ng-template>
      <ng-template #subtitle>{{ item().product.category }}</ng-template>
      <div class="app-stack">
        <p-tag [value]="item().shop.name" />
        @if (item().model) {
          <div>Модель: {{ item().model }}</div>
        }
        <strong>{{ money(item().price) }}</strong>
        <div>В наличии: {{ item().quantity }}</div>
        <ng-content />
      </div>
    </p-card>
  `,
})
export class ProductInfoCard {
  readonly item = input.required<ProductInfo>();
  readonly paths = paths;
  readonly money = formatMoney;
}
