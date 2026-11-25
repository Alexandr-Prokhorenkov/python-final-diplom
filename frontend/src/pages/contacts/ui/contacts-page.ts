import { Component, inject, signal, viewChild } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { firstValueFrom } from 'rxjs';

import { Contact, ContactApi, formatContact } from '@entities/contact';
import { ContactForm, SaveContactApi } from '@features/save-contact';
import { EmptyState, PageHeader } from '@shared/ui';

@Component({
  selector: 'page-contacts',
  imports: [PageHeader, TableModule, Button, ContactForm, EmptyState],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.scss',
})
export class ContactsPage {
  private readonly api = inject(ContactApi);
  private readonly mutate = inject(SaveContactApi);
  private readonly confirmations = inject(ConfirmationService);
  private readonly form = viewChild.required(ContactForm);

  readonly contacts = signal<Contact[]>([]);
  readonly format = formatContact;

  constructor() {
    void this.reload();
  }

  open(contact: Contact | null): void {
    this.form().open(contact);
  }

  async onSaved(): Promise<void> {
    await this.reload();
  }

  remove(contact: Contact): void {
    this.confirmations.confirm({
      message: 'Удалить адрес?',
      header: 'Контакты',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      accept: () => void this.delete(contact.id),
    });
  }

  private async delete(id: number): Promise<void> {
    await firstValueFrom(this.mutate.remove(id));
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.contacts.set(await firstValueFrom(this.api.list()));
  }
}
