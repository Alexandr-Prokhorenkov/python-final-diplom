import { Component } from '@angular/core';
import { Card } from 'primeng/card';

import { PasswordResetForm } from '@features/auth-password-reset';

@Component({
  selector: 'page-password-reset',
  imports: [Card, PasswordResetForm],
  templateUrl: './password-reset-page.html',
  styleUrl: './password-reset-page.scss',
})
export class PasswordResetPage {}
