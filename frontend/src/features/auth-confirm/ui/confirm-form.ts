import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Textarea } from 'primeng/textarea';
import { firstValueFrom } from 'rxjs';

import { parseApiErrors } from '@shared/api';
import { paths } from '@shared/routes';

import { ConfirmApi } from '../api/confirm.api';

@Component({
  selector: 'feature-confirm-form',
  imports: [FormsModule, Button, InputText, Textarea, Message],
  templateUrl: './confirm-form.html',
  styleUrl: './confirm-form.scss',
})
export class ConfirmForm implements OnInit {
  private readonly api = inject(ConfirmApi);
  private readonly router = inject(Router);

  readonly initialEmail = input('', { alias: 'email' });

  email = '';
  token = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.email = this.initialEmail();
  }

  async submit(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.confirm(this.email, this.token.trim()));
      await this.router.navigateByUrl(paths.login);
    } catch (error) {
      this.error.set(parseApiErrors(error).join('\n'));
    } finally {
      this.loading.set(false);
    }
  }
}
