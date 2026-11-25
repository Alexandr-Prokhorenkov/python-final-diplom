import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { firstValueFrom } from 'rxjs';

import { Contact, ContactPayload } from '@entities/contact';
import { parseApiErrors } from '@shared/api';

import { SaveContactApi } from '../api/save-contact.api';

@Component({
  selector: 'feature-contact-form',
  imports: [FormsModule, Button, Dialog, InputText, Message],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  private readonly api = inject(SaveContactApi);

  readonly contact = input<Contact | null>(null);
  readonly showTrigger = input(true);
  readonly saved = output<void>();
  dialog = false;
  private active: Contact | null = null;

  get isEdit(): boolean {
    return !!(this.active ?? this.contact());
  }

  city = '';
  street = '';
  house = '';
  structure = '';
  building = '';
  apartment = '';
  phone = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  open(contact: Contact | null = this.contact()): void {
    this.active = contact;
    this.hydrate();
    this.error.set(null);
    this.dialog = true;
  }

  async submit(): Promise<void> {
    const payload: ContactPayload = {
      city: this.city,
      street: this.street,
      house: this.house,
      structure: this.structure,
      building: this.building,
      apartment: this.apartment,
      phone: this.phone,
    };
    const current = this.active ?? this.contact();
    this.error.set(null);
    this.loading.set(true);
    try {
      if (current) {
        await firstValueFrom(this.api.update({ ...payload, id: current.id }));
      } else {
        await firstValueFrom(this.api.create(payload));
      }
      this.dialog = false;
      this.saved.emit();
    } catch (error) {
      this.error.set(parseApiErrors(error).join('\n'));
    } finally {
      this.loading.set(false);
    }
  }

  private hydrate(): void {
    const current = this.active ?? this.contact();
    this.city = current?.city ?? '';
    this.street = current?.street ?? '';
    this.house = current?.house ?? '';
    this.structure = current?.structure ?? '';
    this.building = current?.building ?? '';
    this.apartment = current?.apartment ?? '';
    this.phone = current?.phone ?? '';
  }
}
