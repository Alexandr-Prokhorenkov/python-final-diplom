import { Component } from '@angular/core';
import { Card } from 'primeng/card';

import { RegisterForm } from '@features/auth-register';

@Component({
  selector: 'page-register',
  imports: [Card, RegisterForm],
  template: `
    <p-card header="Регистрация покупателя">
      <feature-register-form />
    </p-card>
  `,
})
export class RegisterPage {}
