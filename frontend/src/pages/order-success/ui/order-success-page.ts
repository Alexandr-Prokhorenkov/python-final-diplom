import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Tag } from 'primeng/tag';
import { firstValueFrom } from 'rxjs';

import { Order, OrderApi } from '@entities/order';
import { formatMoney, orderStatusLabel, orderStatusSeverity } from '@shared/lib';
import { paths } from '@shared/routes';
import { PageHeader } from '@shared/ui';

@Component({
  selector: 'page-order-success',
  imports: [PageHeader, Card, Tag, Button, RouterLink, DatePipe],
  template: `
    <section class="app-page">
      <ui-page-header title="Спасибо за заказ" subtitle="Номер заказа сохранён в истории" />
      @if (order(); as current) {
        <p-card [header]="'Заказ №' + current.id">
          <div class="app-stack">
            <div>{{ current.dt | date: 'dd.MM.yyyy HH:mm' }}</div>
            <p-tag [value]="label(current.state)" [severity]="severity(current.state)" />
            <div>Сумма: {{ money(current.total_sum) }}</div>
            @if (current.contact) {
              <div>{{ current.contact.city }}, {{ current.contact.street }} {{ current.contact.house }}</div>
            }
            <p-button label="К списку заказов" [routerLink]="paths.orders" />
          </div>
        </p-card>
      }
    </section>
  `,
})
export class OrderSuccessPage {
  private readonly api = inject(OrderApi);
  private readonly route = inject(ActivatedRoute);
  readonly order = signal<Order | null>(null);
  readonly paths = paths;
  readonly money = formatMoney;
  readonly label = orderStatusLabel;
  readonly severity = orderStatusSeverity;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      void firstValueFrom(this.api.detail(id)).then((order) => this.order.set(order));
    }
  }
}
