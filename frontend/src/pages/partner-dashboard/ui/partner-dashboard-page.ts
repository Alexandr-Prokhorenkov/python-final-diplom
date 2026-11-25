import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Shop, ShopApi } from '@entities/shop';
import { PageHeader } from '@shared/ui';
import { PartnerToolbarWidget } from '@widgets/partner-toolbar';

@Component({
  selector: 'page-partner-dashboard',
  imports: [PageHeader, PartnerToolbarWidget],
  template: `
    <section class="app-page">
      <ui-page-header title="Кабинет магазина" subtitle="Витрина, импорт и экспорт прайса" />
      <widget-partner-toolbar [shop]="shop()" (stateChanged)="onState($event)" />
    </section>
  `,
})
export class PartnerDashboardPage {
  private readonly api = inject(ShopApi);
  readonly shop = signal<Shop | null>(null);

  constructor() {
    void this.reload();
  }

  onState(state: boolean): void {
    const current = this.shop();
    if (current) {
      this.shop.set({ ...current, state });
    }
  }

  private async reload(): Promise<void> {
    this.shop.set(await firstValueFrom(this.api.partnerState()));
  }
}
