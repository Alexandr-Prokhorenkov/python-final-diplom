import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Shop, ShopApi } from '@entities/shop';
import { PageHeader } from '@shared/ui';
import { PartnerToolbarWidget } from '@widgets/partner-toolbar';

@Component({
  selector: 'page-partner-dashboard',
  imports: [PageHeader, PartnerToolbarWidget],
  templateUrl: './partner-dashboard-page.html',
  styleUrl: './partner-dashboard-page.scss',
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
