import { Component, input } from '@angular/core';
import { Panel } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';

import { formatMoney } from '@shared/lib';

import { ProductInfo } from '../model/types';

@Component({
  selector: 'entity-product-info-details',
  imports: [Panel, TableModule, Tag],
  templateUrl: './product-info-details.html',
  styleUrl: './product-info-details.scss',
})
export class ProductInfoDetails {
  readonly item = input.required<ProductInfo>();
  readonly money = formatMoney;
}
