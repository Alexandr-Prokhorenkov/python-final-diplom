import { Component } from '@angular/core';
import { Card } from 'primeng/card';

import { PasswordResetForm } from '@features/auth-password-reset';

@Component({
  selector: 'page-password-reset',
  imports: [Card, PasswordResetForm],
  template: `
    <p-card header="Сброс пароля">
      <feature-password-reset-form />
    </p-card>
  `,
})
export class PasswordResetPage {}
