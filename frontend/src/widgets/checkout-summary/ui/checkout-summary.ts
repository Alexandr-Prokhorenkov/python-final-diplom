import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';

import { Contact, formatContact } from '@entities/contact';
import { Order } from '@entities/order';
import { formatMoney } from '@shared/lib';

@Component({
  selector: 'widget-checkout-summary',
  imports: [Card, Select, FormsModule],
  template: `
    <div class="app-stack">
      <p-card header="Заказ">
        @if (basket(); as order) {
          <ul>
            @for (item of order.ordered_items; track item.id) {
              <li>
                {{ item.product_info.product.name }} / {{ item.product_info.shop.name }} —
                {{ item.quantity }} × {{ money(item.price) }}
              </li>
            }
          </ul>
          <strong>Итого: {{ money(order.total_sum) }}</strong>
        }
      </p-card>
      <p-card header="Адрес доставки">
        @if (!contacts().length) {
          <p>Добавьте адрес ниже.</p>
        } @else {
          <p-select
            [options]="contactOptions()"
            optionLabel="label"
            optionValue="id"
            [(ngModel)]="selectedId"
            placeholder="Выберите адрес"
            appendTo="body"
            styleClass="w-full"
          />
        }
      </p-card>
    </div>
  `,
})
export class CheckoutSummaryWidget {
  readonly basket = input<Order | null>(null);
  readonly contacts = input<Contact[]>([]);
  readonly selectedId = model<number | null>(null);
  readonly money = formatMoney;

  contactOptions() {
    return this.contacts().map((contact) => ({
      id: contact.id,
      label: formatContact(contact),
    }));
  }
}
