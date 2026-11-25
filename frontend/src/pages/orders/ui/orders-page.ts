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
  templateUrl: './orders-page.html',
  styleUrl: './orders-page.scss',
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
