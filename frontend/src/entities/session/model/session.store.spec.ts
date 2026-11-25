import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthEvents, TokenStorage } from '@shared/api';
import { UserApi } from '@entities/user';

import { SessionStore } from './session.store';

describe('SessionStore', () => {
  let store: SessionStore;
  let tokens: TokenStorage;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        SessionStore,
        TokenStorage,
        AuthEvents,
        {
          provide: UserApi,
          useValue: {
            details: () =>
              of({
                id: 1,
                first_name: 'Иван',
                last_name: 'Иванов',
                email: 'ivan@test.local',
                company: '',
                position: '',
                type: 'buyer',
              }),
          },
        },
      ],
    });
    store = TestBed.inject(SessionStore);
    tokens = TestBed.inject(TokenStorage);
  });

  it('stores token and user after login', async () => {
    const user = await store.setToken('abc');
    expect(tokens.get()).toBe('abc');
    expect(user.type).toBe('buyer');
    expect(store.isBuyer()).toBeTrue();
  });

  it('clears session on logout', async () => {
    await store.setToken('abc');
    store.clear();
    expect(tokens.get()).toBeNull();
    expect(store.user()).toBeNull();
  });
});
