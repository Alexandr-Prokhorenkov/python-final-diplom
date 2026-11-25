import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BasketStore } from '@entities/basket';
import { PageHeader } from '@shared/ui';
import { BasketPanelWidget } from '@widgets/basket-panel';

@Component({
  selector: 'page-basket',
  imports: [PageHeader, BasketPanelWidget],
  template: `
    <section class="app-page">
      <ui-page-header title="Корзина" />
      <widget-basket-panel />
    </section>
  `,
})
export class BasketPage {
  constructor() {
    void firstValueFrom(inject(BasketStore).load());
  }
}
