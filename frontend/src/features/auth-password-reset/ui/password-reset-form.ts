import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Textarea } from 'primeng/textarea';
import { firstValueFrom } from 'rxjs';

import { parseApiErrors } from '@shared/api';
import { paths } from '@shared/routes';

import { PasswordResetApi } from '../api/password-reset.api';

@Component({
  selector: 'feature-password-reset-form',
  imports: [FormsModule, Button, InputText, Password, Textarea, Message],
  templateUrl: './password-reset-form.html',
  styleUrl: './password-reset-form.scss',
})
export class PasswordResetForm {
  private readonly api = inject(PasswordResetApi);
  private readonly router = inject(Router);

  email = '';
  token = '';
  password = '';
  readonly loadingRequest = signal(false);
  readonly loadingConfirm = signal(false);
  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);

  async requestToken(): Promise<void> {
    this.error.set(null);
    this.loadingRequest.set(true);
    try {
      await firstValueFrom(this.api.request(this.email));
      this.info.set('Токен отправлен. Смотрите письмо в терминале сервера.');
    } catch (error) {
      this.error.set(parseApiErrors(error).join('\n'));
    } finally {
      this.loadingRequest.set(false);
    }
  }

  async confirm(): Promise<void> {
    this.error.set(null);
    this.loadingConfirm.set(true);
    try {
      await firstValueFrom(this.api.confirm(this.token.trim(), this.password));
      await this.router.navigateByUrl(paths.login);
    } catch (error) {
      this.error.set(parseApiErrors(error).join('\n'));
    } finally {
      this.loadingConfirm.set(false);
    }
  }
}
