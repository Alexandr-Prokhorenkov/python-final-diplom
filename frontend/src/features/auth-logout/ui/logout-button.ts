import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';

import { BasketStore } from '@entities/basket';
import { SessionStore } from '@entities/session';
import { paths } from '@shared/routes';

@Component({
  selector: 'feature-logout-button',
  imports: [Button],
  templateUrl: './logout-button.html',
  styleUrl: './logout-button.scss',
})
export class LogoutButton {
  private readonly session = inject(SessionStore);
  private readonly basket = inject(BasketStore);
  private readonly router = inject(Router);

  logout(): void {
    this.session.clear();
    this.basket.clear();
    void this.router.navigateByUrl(paths.catalog);
  }
}
