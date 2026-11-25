import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { firstValueFrom } from 'rxjs';

import { parseApiErrors } from '@shared/api';
import { paths } from '@shared/routes';

import { RegisterApi } from '../api/register.api';

@Component({
  selector: 'feature-register-form',
  imports: [FormsModule, Button, InputText, Password, Message, RouterLink],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
})
export class RegisterForm {
  private readonly api = inject(RegisterApi);
  private readonly router = inject(Router);

  readonly paths = paths;
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    try {
      await firstValueFrom(
        this.api.register({
          first_name: this.firstName,
          last_name: this.lastName,
          email: this.email,
          password: this.password,
        }),
      );
      await this.router.navigate([paths.registerConfirm], { queryParams: { email: this.email } });
    } catch (error) {
      this.error.set(parseApiErrors(error).join('\n'));
    } finally {
      this.loading.set(false);
    }
  }
}
