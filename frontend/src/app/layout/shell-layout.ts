import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { BasketStore } from '@entities/basket';
import { SessionStore } from '@entities/session';
import { ConfirmHost, ToastHost } from '@shared/ui';
import { HeaderWidget } from '@widgets/header';

@Component({
  selector: 'app-shell-layout',
  imports: [RouterOutlet, HeaderWidget, ToastHost, ConfirmHost],
  template: `
    <div class="app-shell">
      <widget-header />
      <main class="app-shell__body">
        <router-outlet />
      </main>
      <ui-toast-host />
      <ui-confirm-host />
    </div>
  `,
})
export class ShellLayout {
  constructor() {
    const session = inject(SessionStore);
    const basket = inject(BasketStore);
    if (session.isBuyer()) {
      void firstValueFrom(basket.load());
    }
  }
}
