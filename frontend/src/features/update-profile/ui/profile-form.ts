import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { firstValueFrom } from 'rxjs';

import { SessionStore } from '@entities/session';
import { parseApiErrors } from '@shared/api';

import { UpdateProfileApi } from '../api/update-profile.api';

@Component({
  selector: 'feature-profile-form',
  imports: [FormsModule, Button, InputText, Password, Message],
  template: `
    <form class="app-form" (ngSubmit)="submit()">
      @if (error()) {
        <p-message severity="error" [text]="error()!" />
      }
      @if (info()) {
        <p-message severity="success" [text]="info()!" />
      }
      <label>Имя <input pInputText name="first_name" [(ngModel)]="firstName" /></label>
      <label>Фамилия <input pInputText name="last_name" [(ngModel)]="lastName" /></label>
      <label>Компания <input pInputText name="company" [(ngModel)]="company" /></label>
      <label>Должность <input pInputText name="position" [(ngModel)]="position" /></label>
      <label>
        Новый пароль (необязательно)
        <p-password [(ngModel)]="password" name="password" [toggleMask]="true" [feedback]="false" />
      </label>
      <p-button type="submit" label="Сохранить" [loading]="loading()" />
    </form>
  `,
})
export class ProfileForm {
  private readonly api = inject(UpdateProfileApi);
  private readonly session = inject(SessionStore);

  firstName = '';
  lastName = '';
  company = '';
  position = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);

  constructor() {
    const user = this.session.user();
    this.firstName = user?.first_name ?? '';
    this.lastName = user?.last_name ?? '';
    this.company = user?.company ?? '';
    this.position = user?.position ?? '';
  }

  async submit(): Promise<void> {
    this.error.set(null);
    this.info.set(null);
    this.loading.set(true);
    try {
      const payload: Record<string, string> = {
        first_name: this.firstName,
        last_name: this.lastName,
        company: this.company,
        position: this.position,
      };
      if (this.password) {
        payload['password'] = this.password;
      }
      await firstValueFrom(this.api.update(payload));
      if (this.password) {
        this.info.set('Пароль изменён, войдите снова.');
        this.session.clear();
        return;
      }
      await this.session.restore();
      this.info.set('Профиль сохранён');
      this.password = '';
    } catch (error) {
      this.error.set(parseApiErrors(error).join('\n'));
    } finally {
      this.loading.set(false);
    }
  }
}
