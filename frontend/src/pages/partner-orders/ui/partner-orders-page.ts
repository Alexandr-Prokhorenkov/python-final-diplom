import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';

import { Order, OrderApi } from '@entities/order';
import { OrderStatusSelect } from '@features/change-order-status';
import { formatMoney, orderStatusLabel, orderStatusSeverity } from '@shared/lib';
import { EmptyState, PageHeader } from '@shared/ui';

@Component({
  selector: 'page-partner-orders',
  imports: [PageHeader, TableModule, Tag, OrderStatusSelect, DatePipe, EmptyState],
  templateUrl: './partner-orders-page.html',
  styleUrl: './partner-orders-page.scss',
})
export class PartnerOrdersPage {
  private readonly api = inject(OrderApi);
  readonly orders = signal<Order[]>([]);
  readonly money = formatMoney;
  readonly label = orderStatusLabel;
  readonly severity = orderStatusSeverity;

  constructor() {
    void this.reload();
  }

  onChanged(id: number, state: string): void {
    this.orders.update((orders) =>
      orders.map((order) => (order.id === id ? { ...order, state } : order)),
    );
  }

  private async reload(): Promise<void> {
    this.orders.set(await firstValueFrom(this.api.partnerList()));
  }
}
