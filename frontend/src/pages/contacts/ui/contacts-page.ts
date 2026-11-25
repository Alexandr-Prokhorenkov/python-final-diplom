import { Component, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { firstValueFrom } from 'rxjs';

import { Contact, ContactApi, formatContact } from '@entities/contact';
import { ContactForm, SaveContactApi } from '@features/save-contact';
import { EmptyState, PageHeader } from '@shared/ui';

@Component({
  selector: 'page-contacts',
  imports: [PageHeader, TableModule, Button, Dialog, ContactForm, EmptyState],
  templateUrl: './contacts-page.html',
  styleUrl: './contacts-page.scss',
})
export class ContactsPage {
  private readonly api = inject(ContactApi);
  private readonly mutate = inject(SaveContactApi);
  private readonly confirmations = inject(ConfirmationService);

  readonly contacts = signal<Contact[]>([]);
  readonly editing = signal<Contact | null>(null);
  dialog = false;
  readonly format = formatContact;

  constructor() {
    void this.reload();
  }

  open(contact: Contact | null): void {
    this.editing.set(contact);
    this.dialog = true;
  }

  async onSaved(): Promise<void> {
    this.dialog = false;
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
