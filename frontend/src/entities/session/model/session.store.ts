import { computed, inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthEvents, TokenStorage } from '@shared/api';
import { User, UserApi } from '@entities/user';

@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly tokens = inject(TokenStorage);
  private readonly users = inject(UserApi);
  private readonly authEvents = inject(AuthEvents);

  readonly user = signal<User | null>(null);
  readonly ready = signal(false);
  readonly token = this.tokens.token;
  readonly isAuthenticated = computed(() => Boolean(this.tokens.get()) && Boolean(this.user()));
  readonly isBuyer = computed(() => this.user()?.type === 'buyer');
  readonly isShop = computed(() => this.user()?.type === 'shop');
  readonly displayName = computed(() => {
    const user = this.user();
    if (!user) {
      return '';
    }
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  });

  constructor() {
    this.authEvents.unauthorized$.subscribe(() => this.clearLocal());
  }

  async restore(): Promise<void> {
    if (!this.tokens.get()) {
      this.ready.set(true);
      return;
    }
    try {
      const user = await firstValueFrom(this.users.details());
      this.user.set(user);
    } catch {
      this.clear();
    } finally {
      this.ready.set(true);
    }
  }

  async setToken(token: string): Promise<User> {
    this.tokens.set(token);
    const user = await firstValueFrom(this.users.details());
    this.user.set(user);
    this.ready.set(true);
    return user;
  }

  clear(): void {
    this.tokens.clear();
    this.clearLocal();
  }

  private clearLocal(): void {
    this.user.set(null);
  }
}
