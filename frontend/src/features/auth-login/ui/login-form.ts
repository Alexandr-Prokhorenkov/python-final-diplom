import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { firstValueFrom } from 'rxjs';

import { SessionStore } from '@entities/session';
import { parseApiErrors } from '@shared/api';
import { paths } from '@shared/routes';

import { LoginApi } from '../api/login.api';

@Component({
  selector: 'feature-login-form',
  imports: [FormsModule, Button, InputText, Password, Message, RouterLink],
  template: `
    <form class="app-form" (ngSubmit)="submit()">
      @if (error()) {
        <p-message severity="error" [text]="error()!" />
      }
      <label>
        Email
        <input pInputText name="email" [(ngModel)]="email" type="email" required />
      </label>
      <label>
        Пароль
        <p-password [(ngModel)]="password" name="password" [feedback]="false" [toggleMask]="true" />
      </label>
      <p-button type="submit" label="Войти" [loading]="loading()" />
      <a [routerLink]="paths.register">Нет аккаунта? Регистрация</a>
      <a [routerLink]="paths.passwordReset">Забыли пароль</a>
    </form>
  `,
})
export class LoginForm {
  private readonly api = inject(LoginApi);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);

  readonly paths = paths;
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    try {
      const response = await firstValueFrom(this.api.login(this.email, this.password));
      const user = await this.session.setToken(response.Token);
      await this.router.navigateByUrl(user.type === 'shop' ? paths.partner : paths.catalog);
    } catch (error) {
      this.error.set(parseApiErrors(error).join('\n'));
    } finally {
      this.loading.set(false);
    }
  }
}
