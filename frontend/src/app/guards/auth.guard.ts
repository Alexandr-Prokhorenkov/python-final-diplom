import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { SessionStore } from '@entities/session';
import { paths } from '@shared/routes';

export const authGuard: CanActivateFn = async () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (!session.ready()) {
    await session.restore();
  }
  return session.isAuthenticated() ? true : router.createUrlTree([paths.login]);
};

export const guestGuard: CanActivateFn = async () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (!session.ready()) {
    await session.restore();
  }
  if (!session.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree([session.isShop() ? paths.partner : paths.catalog]);
};

export const buyerGuard: CanActivateFn = async () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (!session.ready()) {
    await session.restore();
  }
  if (!session.isAuthenticated()) {
    return router.createUrlTree([paths.login]);
  }
  return session.isBuyer() ? true : router.createUrlTree([paths.forbidden]);
};

export const shopGuard: CanActivateFn = async () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  if (!session.ready()) {
    await session.restore();
  }
  if (!session.isAuthenticated()) {
    return router.createUrlTree([paths.login]);
  }
  return session.isShop() ? true : router.createUrlTree([paths.forbidden]);
};
