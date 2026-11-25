import { Component } from '@angular/core';
import { Card } from 'primeng/card';

import { LoginForm } from '@features/auth-login';

@Component({
  selector: 'page-login',
  imports: [Card, LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {}
