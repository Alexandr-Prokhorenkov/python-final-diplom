import { Component, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { firstValueFrom } from 'rxjs';

import { parseApiErrors } from '@shared/api';

import { ExportPriceApi } from '../api/export-price.api';

@Component({
  selector: 'feature-export-price',
  imports: [Button],
  template: `
    <p-button
      label="Скачать YAML"
      icon="pi pi-download"
      severity="secondary"
      [loading]="loading()"
      (onClick)="exportYaml()"
    />
  `,
})
export class ExportPriceButton {
  private readonly api = inject(ExportPriceApi);
  private readonly messages = inject(MessageService);
  readonly loading = signal(false);

  async exportYaml(): Promise<void> {
    this.loading.set(true);
    try {
      const blob = await firstValueFrom(this.api.download());
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'price.yaml';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      this.messages.add({
        severity: 'error',
        summary: 'Экспорт',
        detail: parseApiErrors(error).join('\n'),
      });
    } finally {
      this.loading.set(false);
    }
  }
}
