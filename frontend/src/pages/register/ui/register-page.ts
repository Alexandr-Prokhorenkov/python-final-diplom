import { Component } from '@angular/core';
import { Card } from 'primeng/card';

import { RegisterForm } from '@features/auth-register';

@Component({
  selector: 'page-register',
  imports: [Card, RegisterForm],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
})
export class RegisterPage {}
