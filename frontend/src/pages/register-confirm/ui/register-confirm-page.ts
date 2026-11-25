import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Card } from 'primeng/card';

import { ConfirmForm } from '@features/auth-confirm';

@Component({
  selector: 'page-register-confirm',
  imports: [Card, ConfirmForm],
  template: `
    <p-card header="Подтверждение email">
      <feature-confirm-form [email]="email" />
    </p-card>
  `,
})
export class RegisterConfirmPage {
  readonly email = inject(ActivatedRoute).snapshot.queryParamMap.get('email') ?? '';
}
