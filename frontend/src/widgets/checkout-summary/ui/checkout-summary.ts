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
  templateUrl: './checkout-summary.html',
  styleUrl: './checkout-summary.scss',
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
