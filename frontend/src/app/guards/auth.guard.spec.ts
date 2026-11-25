import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, RouterStateSnapshot } from '@angular/router';

import { SessionStore } from '@entities/session';
import { TokenStorage } from '@shared/api';

import { authGuard, buyerGuard, guestGuard } from './auth.guard';

class SessionStub {
  ready = () => true;
  restore = async () => undefined;
  isAuthenticated = () => false;
  isBuyer = () => false;
  isShop = () => false;
}

const route = {} as ActivatedRouteSnapshot;
const state = { url: '/' } as RouterStateSnapshot;

describe('auth guards', () => {
  let session: SessionStub;

  beforeEach(() => {
    session = new SessionStub();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: SessionStore, useValue: session },
        TokenStorage,
      ],
    });
  });

  it('authGuard redirects guests to login', async () => {
    const result = await TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(String(result)).toContain('/login');
  });

  it('guestGuard allows anonymous users', async () => {
    const result = await TestBed.runInInjectionContext(() => guestGuard(route, state));
    expect(result).toBeTrue();
  });

  it('buyerGuard sends shop users to 403', async () => {
    session.isAuthenticated = () => true;
    session.isShop = () => true;
    const result = await TestBed.runInInjectionContext(() => buyerGuard(route, state));
    expect(String(result)).toContain('/403');
  });

  it('authGuard allows an authenticated user', async () => {
    session.isAuthenticated = () => true;
    const result = await TestBed.runInInjectionContext(() => authGuard(route, state));
    expect(result).toBeTrue();
  });
});
