import { Component, input, output } from '@angular/core';
import { Card } from 'primeng/card';

import { Shop } from '@entities/shop';
import { ExportPriceButton } from '@features/export-price';
import { ImportPriceUrlForm } from '@features/import-price-url';
import { ShopStateSwitch } from '@features/toggle-shop-state';

@Component({
  selector: 'widget-partner-toolbar',
  imports: [Card, ShopStateSwitch, ImportPriceUrlForm, ExportPriceButton],
  templateUrl: './partner-toolbar.html',
  styleUrl: './partner-toolbar.scss',
})
export class PartnerToolbarWidget {
  readonly shop = input<Shop | null>(null);
  readonly stateChanged = output<boolean>();
}
