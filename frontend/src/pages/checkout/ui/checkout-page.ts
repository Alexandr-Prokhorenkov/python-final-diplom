import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { BasketStore } from '@entities/basket';
import { Contact, ContactApi } from '@entities/contact';
import { ContactForm } from '@features/save-contact';
import { PlaceOrderButton } from '@features/place-order';
import { PageHeader } from '@shared/ui';
import { CheckoutSummaryWidget } from '@widgets/checkout-summary';

@Component({
  selector: 'page-checkout',
  imports: [PageHeader, CheckoutSummaryWidget, ContactForm, PlaceOrderButton],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage {
  readonly basket = inject(BasketStore);
  private readonly contactsApi = inject(ContactApi);
  readonly contacts = signal<Contact[]>([]);
  readonly selectedId = signal<number | null>(null);

  constructor() {
    void firstValueFrom(this.basket.load());
    void this.reloadContacts();
  }

  async reloadContacts(): Promise<void> {
    const list = await firstValueFrom(this.contactsApi.list());
    this.contacts.set(list);
    if (!this.selectedId() && list.length) {
      this.selectedId.set(list[0].id);
    }
  }
}
