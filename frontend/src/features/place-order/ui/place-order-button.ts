import { Component, inject, input, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { firstValueFrom } from 'rxjs';

import { BasketStore } from '@entities/basket';
import { parseApiErrors } from '@shared/api';
import { paths } from '@shared/routes';

import { PlaceOrderApi } from '../api/place-order.api';

@Component({
  selector: 'feature-place-order',
  imports: [Button],
  templateUrl: './place-order-button.html',
  styleUrl: './place-order-button.scss',
})
export class PlaceOrderButton {
  private readonly api = inject(PlaceOrderApi);
  private readonly basket = inject(BasketStore);
  private readonly router = inject(Router);

  readonly orderId = input<number | null>(null);
  readonly contactId = input<number | null>(null);
  readonly placed = output<number>();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async submit(): Promise<void> {
    const orderId = this.orderId();
    const contactId = this.contactId();
    if (!orderId || !contactId) {
      return;
    }
    this.error.set(null);
    this.loading.set(true);
    try {
      const result = await firstValueFrom(this.api.place(orderId, contactId));
      this.basket.clear();
      this.placed.emit(result.id);
      await this.router.navigateByUrl(paths.order(result.id));
    } catch (error) {
      this.error.set(parseApiErrors(error).join('\n'));
    } finally {
      this.loading.set(false);
    }
  }
}
