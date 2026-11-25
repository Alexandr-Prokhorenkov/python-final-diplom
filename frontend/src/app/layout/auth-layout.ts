import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastHost } from '@shared/ui';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, ToastHost],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {}
