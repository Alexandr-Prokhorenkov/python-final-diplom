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
  templateUrl: './product-info-card.html',
  styleUrl: './product-info-card.scss',
})
export class ProductInfoCard {
  readonly item = input.required<ProductInfo>();
  readonly paths = paths;
  readonly money = formatMoney;
}
