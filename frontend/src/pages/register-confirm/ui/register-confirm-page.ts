import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Card } from 'primeng/card';

import { ConfirmForm } from '@features/auth-confirm';

@Component({
  selector: 'page-register-confirm',
  imports: [Card, ConfirmForm],
  templateUrl: './register-confirm-page.html',
  styleUrl: './register-confirm-page.scss',
})
export class RegisterConfirmPage {
  readonly email = inject(ActivatedRoute).snapshot.queryParamMap.get('email') ?? '';
}
