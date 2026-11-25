import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { firstValueFrom } from 'rxjs';

import { parseApiErrors } from '@shared/api';
import { ORDER_STATUSES, orderStatusLabel } from '@shared/lib';

import { ChangeOrderStatusApi } from '../api/change-order-status.api';

@Component({
  selector: 'feature-order-status-select',
  imports: [FormsModule, Select],
  templateUrl: './order-status-select.html',
  styleUrl: './order-status-select.scss',
})
export class OrderStatusSelect {
  private readonly api = inject(ChangeOrderStatusApi);
  private readonly messages = inject(MessageService);

  readonly orderId = input.required<number>();
  readonly state = input.required<string>();
  readonly changed = output<string>();
  readonly loading = signal(false);

  readonly options = ORDER_STATUSES.map((value) => ({
    value,
    label: orderStatusLabel(value),
  }));

  async change(state: string): Promise<void> {
    if (state === this.state()) {
      return;
    }
    this.loading.set(true);
    try {
      const result = await firstValueFrom(this.api.update(this.orderId(), state));
      this.changed.emit(result.state);
    } catch (error) {
      this.messages.add({
        severity: 'error',
        summary: 'Статус',
        detail: parseApiErrors(error).join('\n'),
      });
    } finally {
      this.loading.set(false);
    }
  }
}
