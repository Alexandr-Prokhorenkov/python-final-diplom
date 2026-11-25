import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

import { API_BASE } from '@shared/api';
import { Order } from '@entities/order';

@Injectable({ providedIn: 'root' })
export class BasketStore {
  private readonly http = inject(HttpClient);
  readonly basket = signal<Order | null>(null);
  readonly loading = signal(false);

  readonly itemCount = computed(
    () => this.basket()?.ordered_items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
  );

  load() {
    this.loading.set(true);
    return this.http.get<Order>(`${API_BASE}/basket`).pipe(
      tap({
        next: (basket) => {
          this.basket.set(basket);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      }),
    );
  }

  set(basket: Order): void {
    this.basket.set(basket);
  }

  clear(): void {
    this.basket.set(null);
  }
}
