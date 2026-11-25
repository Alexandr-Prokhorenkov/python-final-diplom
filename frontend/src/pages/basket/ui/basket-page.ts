import { Component, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BasketStore } from '@entities/basket';
import { PageHeader } from '@shared/ui';
import { BasketPanelWidget } from '@widgets/basket-panel';

@Component({
  selector: 'page-basket',
  imports: [PageHeader, BasketPanelWidget],
  templateUrl: './basket-page.html',
  styleUrl: './basket-page.scss',
})
export class BasketPage {
  constructor() {
    void firstValueFrom(inject(BasketStore).load());
  }
}
