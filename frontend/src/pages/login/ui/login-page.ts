import { Component } from '@angular/core';
import { Card } from 'primeng/card';

import { LoginForm } from '@features/auth-login';

@Component({
  selector: 'page-login',
  imports: [Card, LoginForm],
  template: `
    <p-card header="Вход">
      <feature-login-form />
    </p-card>
  `,
})
export class LoginPage {}
