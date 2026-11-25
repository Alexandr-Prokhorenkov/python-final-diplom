import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputNumber } from 'primeng/inputnumber';
import { firstValueFrom } from 'rxjs';

import { BasketStore } from '@entities/basket';
import { parseApiErrors } from '@shared/api';

import { UpdateBasketItemApi } from '../api/update-basket-item.api';

@Component({
  selector: 'feature-update-basket-item',
  imports: [FormsModule, InputNumber],
  templateUrl: './update-basket-item.html',
  styleUrl: './update-basket-item.scss',
})
export class UpdateBasketItem {
  private readonly api = inject(UpdateBasketItemApi);
  private readonly basket = inject(BasketStore);
  private readonly messages = inject(MessageService);

  readonly itemId = input.required<number>();
  readonly quantity = input.required<number>();
  readonly loading = signal(false);

  async change(quantity: number): Promise<void> {
    if (!quantity || quantity === this.quantity()) {
      return;
    }
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.update(this.itemId(), quantity));
      await firstValueFrom(this.basket.load());
    } catch (error) {
      this.messages.add({
        severity: 'error',
        summary: 'Корзина',
        detail: parseApiErrors(error).join('\n'),
      });
    } finally {
      this.loading.set(false);
    }
  }
}
