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
  template: `
    <section class="app-page">
      <ui-page-header title="Адреса доставки" />
      <p-button label="Новый адрес" icon="pi pi-plus" (onClick)="open(null)" />
      @if (!contacts().length) {
        <ui-empty-state text="Адресов нет. Можно сохранить не больше пяти." />
      } @else {
        <p-table [value]="contacts()">
          <ng-template #header>
            <tr>
              <th>Адрес</th>
              <th></th>
            </tr>
          </ng-template>
          <ng-template #body let-contact>
            <tr>
              <td>{{ format(contact) }}</td>
              <td class="app-row">
                <p-button icon="pi pi-pencil" [text]="true" (onClick)="open(contact)" />
                <p-button icon="pi pi-trash" severity="danger" [text]="true" (onClick)="remove(contact)" />
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
      <p-dialog
        [(visible)]="dialog"
        [header]="editing() ? 'Изменить адрес' : 'Новый адрес'"
        [modal]="true"
        [style]="{ width: '28rem' }"
      >
        <feature-contact-form [contact]="editing()" (saved)="onSaved()" />
      </p-dialog>
    </section>
  `,
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
