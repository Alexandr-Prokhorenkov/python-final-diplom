import { Component, input, output } from '@angular/core';
import { Card } from 'primeng/card';

import { Shop } from '@entities/shop';
import { ExportPriceButton } from '@features/export-price';
import { ImportPriceUrlForm } from '@features/import-price-url';
import { ShopStateSwitch } from '@features/toggle-shop-state';

@Component({
  selector: 'widget-partner-toolbar',
  imports: [Card, ShopStateSwitch, ImportPriceUrlForm, ExportPriceButton],
  template: `
    <div class="app-stack">
      <p-card header="Витрина">
        <feature-shop-state-switch [state]="shop()?.state ?? true" (changed)="stateChanged.emit($event)" />
      </p-card>
      <p-card header="Импорт прайса">
        <feature-import-price-url />
      </p-card>
      <p-card header="Экспорт">
        <feature-export-price />
      </p-card>
    </div>
  `,
})
export class PartnerToolbarWidget {
  readonly shop = input<Shop | null>(null);
  readonly stateChanged = output<boolean>();
}
