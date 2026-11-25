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
  templateUrl: './shell-layout.html',
  styleUrl: './shell-layout.scss',
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
