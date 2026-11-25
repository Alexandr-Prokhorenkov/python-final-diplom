import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { firstValueFrom } from 'rxjs';

import { parseApiErrors } from '@shared/api';

import { ToggleShopStateApi } from '../api/toggle-shop-state.api';

@Component({
  selector: 'feature-shop-state-switch',
  imports: [FormsModule, ToggleSwitch],
  templateUrl: './shop-state-switch.html',
  styleUrl: './shop-state-switch.scss',
})
export class ShopStateSwitch {
  private readonly api = inject(ToggleShopStateApi);
  private readonly messages = inject(MessageService);

  readonly state = input(true);
  readonly changed = output<boolean>();
  readonly loading = signal(false);

  async change(state: boolean): Promise<void> {
    this.loading.set(true);
    try {
      const result = await firstValueFrom(this.api.set(state));
      this.changed.emit(result.state);
    } catch (error) {
      this.messages.add({
        severity: 'error',
        summary: 'Витрина',
        detail: parseApiErrors(error).join('\n'),
      });
    } finally {
      this.loading.set(false);
    }
  }
}
