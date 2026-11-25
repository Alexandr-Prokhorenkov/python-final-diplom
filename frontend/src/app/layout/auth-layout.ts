import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ToastHost } from '@shared/ui';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, ToastHost],
  template: `
    <div class="app-auth">
      <div class="app-auth__card">
        <router-outlet />
      </div>
      <ui-toast-host />
    </div>
  `,
})
export class AuthLayout {}
