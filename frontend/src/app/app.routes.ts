import { Routes } from '@angular/router';

import { buyerGuard, guestGuard, authGuard, shopGuard } from './guards/auth.guard';
import { AuthLayout } from './layout/auth-layout';
import { ShellLayout } from './layout/shell-layout';

const authChildren = (loader: () => Promise<unknown>): Routes => [
  { path: '', loadComponent: loader as () => Promise<new () => unknown> },
];

export const routes: Routes = [
  {
    path: 'login',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      { path: '', loadComponent: () => import('@pages/login').then((m) => m.LoginPage) },
    ],
  },
  {
    path: 'register/confirm',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/register-confirm').then((m) => m.RegisterConfirmPage),
      },
    ],
  },
  {
    path: 'register',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      { path: '', loadComponent: () => import('@pages/register').then((m) => m.RegisterPage) },
    ],
  },
  {
    path: 'password-reset',
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/password-reset').then((m) => m.PasswordResetPage),
      },
    ],
  },
  {
    path: '',
    component: ShellLayout,
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/catalog').then((m) => m.CatalogPage),
      },
      {
        path: 'products/:id',
        loadComponent: () => import('@pages/product').then((m) => m.ProductPage),
      },
      {
        path: 'basket',
        canActivate: [buyerGuard],
        loadComponent: () => import('@pages/basket').then((m) => m.BasketPage),
      },
      {
        path: 'checkout',
        canActivate: [buyerGuard],
        loadComponent: () => import('@pages/checkout').then((m) => m.CheckoutPage),
      },
      {
        path: 'orders/:id',
        canActivate: [buyerGuard],
        loadComponent: () => import('@pages/order-success').then((m) => m.OrderSuccessPage),
      },
      {
        path: 'orders',
        canActivate: [buyerGuard],
        loadComponent: () => import('@pages/orders').then((m) => m.OrdersPage),
      },
      {
        path: 'contacts',
        canActivate: [buyerGuard],
        loadComponent: () => import('@pages/contacts').then((m) => m.ContactsPage),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('@pages/profile').then((m) => m.ProfilePage),
      },
      {
        path: 'partner/orders',
        canActivate: [shopGuard],
        loadComponent: () => import('@pages/partner-orders').then((m) => m.PartnerOrdersPage),
      },
      {
        path: 'partner',
        canActivate: [shopGuard],
        loadComponent: () => import('@pages/partner-dashboard').then((m) => m.PartnerDashboardPage),
      },
      {
        path: '403',
        loadComponent: () => import('@pages/forbidden').then((m) => m.ForbiddenPage),
      },
      {
        path: '**',
        loadComponent: () => import('@pages/not-found').then((m) => m.NotFoundPage),
      },
    ],
  },
];
