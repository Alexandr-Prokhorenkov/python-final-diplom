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
  template: `
    <section class="app-page">
      <ui-page-header title="Заказы магазина" />
      @if (!orders().length) {
        <ui-empty-state text="Заказов с вашими товарами нет" />
      } @else {
        <p-table [value]="orders()">
          <ng-template #header>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Статус</th>
              <th>Сменить</th>
            </tr>
          </ng-template>
          <ng-template #body let-order>
            <tr>
              <td>{{ order.id }}</td>
              <td>{{ order.dt | date: 'dd.MM.yyyy HH:mm' }}</td>
              <td>{{ money(order.total_sum) }}</td>
              <td>
                <p-tag [value]="label(order.state)" [severity]="severity(order.state)" />
              </td>
              <td>
                <feature-order-status-select
                  [orderId]="order.id"
                  [state]="order.state"
                  (changed)="onChanged(order.id, $event)"
                />
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </section>
  `,
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
