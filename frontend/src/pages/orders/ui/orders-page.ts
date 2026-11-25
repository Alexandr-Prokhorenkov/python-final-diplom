import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';

import { Order, OrderApi } from '@entities/order';
import { formatMoney, orderStatusLabel, orderStatusSeverity } from '@shared/lib';
import { paths } from '@shared/routes';
import { EmptyState, PageHeader } from '@shared/ui';

@Component({
  selector: 'page-orders',
  imports: [PageHeader, TableModule, Tag, RouterLink, DatePipe, EmptyState],
  template: `
    <section class="app-page">
      <ui-page-header title="Мои заказы" />
      @if (!orders().length) {
        <ui-empty-state text="Заказов пока нет" />
      } @else {
        <p-table [value]="orders()">
          <ng-template #header>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </ng-template>
          <ng-template #body let-order>
            <tr>
              <td>
                <a [routerLink]="paths.order(order.id)">{{ order.id }}</a>
              </td>
              <td>{{ order.dt | date: 'dd.MM.yyyy HH:mm' }}</td>
              <td>{{ money(order.total_sum) }}</td>
              <td>
                <p-tag [value]="label(order.state)" [severity]="severity(order.state)" />
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </section>
  `,
})
export class OrdersPage {
  private readonly api = inject(OrderApi);
  readonly orders = signal<Order[]>([]);
  readonly paths = paths;
  readonly money = formatMoney;
  readonly label = orderStatusLabel;
  readonly severity = orderStatusSeverity;

  constructor() {
    void firstValueFrom(this.api.list()).then((orders) => this.orders.set(orders));
  }
}
