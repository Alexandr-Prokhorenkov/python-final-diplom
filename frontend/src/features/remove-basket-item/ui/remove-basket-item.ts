import { Component, inject, input, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { firstValueFrom } from 'rxjs';

import { BasketStore } from '@entities/basket';
import { parseApiErrors } from '@shared/api';

import { RemoveBasketItemApi } from '../api/remove-basket-item.api';

@Component({
  selector: 'feature-remove-basket-item',
  imports: [Button],
  template: `
    <p-button
      icon="pi pi-trash"
      severity="danger"
      [rounded]="true"
      [text]="true"
      [loading]="loading()"
      (onClick)="confirm()"
    />
  `,
})
export class RemoveBasketItem {
  private readonly api = inject(RemoveBasketItemApi);
  private readonly basket = inject(BasketStore);
  private readonly confirmations = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  readonly itemId = input.required<number>();
  readonly loading = signal(false);

  confirm(): void {
    this.confirmations.confirm({
      message: 'Удалить позицию из корзины?',
      header: 'Корзина',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      accept: () => void this.remove(),
    });
  }

  private async remove(): Promise<void> {
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.remove(this.itemId()));
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
