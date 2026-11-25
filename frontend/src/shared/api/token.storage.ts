import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'orders_token';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  private readonly tokenSignal = signal<string | null>(this.read());

  readonly token = this.tokenSignal.asReadonly();

  get(): string | null {
    return this.tokenSignal();
  }

  set(token: string): void {
    localStorage.setItem(STORAGE_KEY, token);
    this.tokenSignal.set(token);
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.tokenSignal.set(null);
  }

  private read(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }
}
