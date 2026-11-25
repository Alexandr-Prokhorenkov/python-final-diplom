import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { Menubar } from 'primeng/menubar';

import { BasketStore } from '@entities/basket';
import { SessionStore } from '@entities/session';
import { LogoutButton } from '@features/auth-logout';
import { paths } from '@shared/routes';

@Component({
  selector: 'widget-header',
  imports: [Menubar, Badge, RouterLink, LogoutButton],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderWidget {
  readonly session = inject(SessionStore);
  readonly basket = inject(BasketStore);
  readonly paths = paths;

  readonly items = computed<MenuItem[]>(() => {
    const items: MenuItem[] = [{ label: 'Каталог', routerLink: paths.catalog }];
    if (!this.session.isAuthenticated()) {
      items.push(
        { label: 'Вход', routerLink: paths.login },
        { label: 'Регистрация', routerLink: paths.register },
      );
      return items;
    }
    if (this.session.isBuyer()) {
      items.push(
        { label: 'Корзина', routerLink: paths.basket },
        { label: 'Заказы', routerLink: paths.orders },
        { label: 'Адреса', routerLink: paths.contacts },
        { label: 'Профиль', routerLink: paths.profile },
      );
    }
    if (this.session.isShop()) {
      items.push(
        { label: 'Витрина', routerLink: paths.partner },
        { label: 'Заказы магазина', routerLink: paths.partnerOrders },
        { label: 'Профиль', routerLink: paths.profile },
      );
    }
    return items;
  });
}
