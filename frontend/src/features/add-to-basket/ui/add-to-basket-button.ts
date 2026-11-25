import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { firstValueFrom } from 'rxjs';

import { BasketStore } from '@entities/basket';
import { SessionStore } from '@entities/session';
import { parseApiErrors } from '@shared/api';
import { paths } from '@shared/routes';

import { AddToBasketApi } from '../api/add-to-basket.api';

@Component({
  selector: 'feature-add-to-basket',
  imports: [FormsModule, Button, InputNumber],
  templateUrl: './add-to-basket-button.html',
  styleUrl: './add-to-basket-button.scss',
})
export class AddToBasketButton {
  private readonly api = inject(AddToBasketApi);
  private readonly basket = inject(BasketStore);
  private readonly session = inject(SessionStore);
  private readonly messages = inject(MessageService);
  private readonly router = inject(Router);

  readonly productInfoId = input.required<number>();
  readonly max = input(99);
  quantity = 1;
  readonly loading = signal(false);

  async add(): Promise<void> {
    if (!this.session.isBuyer()) {
      await this.router.navigateByUrl(paths.login);
      return;
    }
    this.loading.set(true);
    try {
      await firstValueFrom(this.api.add(this.productInfoId(), this.quantity));
      await firstValueFrom(this.basket.load());
      this.messages.add({
        severity: 'success',
        summary: 'Корзина',
        detail: 'Товар добавлен',
        life: 2500,
      });
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
