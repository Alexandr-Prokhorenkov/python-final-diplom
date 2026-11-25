import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { firstValueFrom } from 'rxjs';

import { parseApiErrors } from '@shared/api';

import { ImportPriceUrlApi } from '../api/import-price-url.api';

@Component({
  selector: 'feature-import-price-url',
  imports: [FormsModule, Button, InputText, Message],
  template: `
    <form class="app-form" (ngSubmit)="submit()">
      @if (error()) {
        <p-message severity="error" [text]="error()!" />
      }
      @if (info()) {
        <p-message severity="success" [text]="info()!" />
      }
      <label>
        URL YAML-прайса
        <input pInputText name="url" [(ngModel)]="url" placeholder="https://example.com/price.yaml" />
      </label>
      <p-button type="submit" label="Импортировать" [loading]="loading()" />
    </form>
  `,
})
export class ImportPriceUrlForm {
  private readonly api = inject(ImportPriceUrlApi);

  url = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly info = signal<string | null>(null);

  async submit(): Promise<void> {
    this.error.set(null);
    this.info.set(null);
    this.loading.set(true);
    try {
      const result = await firstValueFrom(this.api.importFromUrl(this.url));
      this.info.set(
        `Импорт завершён: создано ${result.created ?? 0}, обновлено ${result.updated ?? 0}`,
      );
    } catch (error) {
      this.error.set(parseApiErrors(error).join('\n'));
    } finally {
      this.loading.set(false);
    }
  }
}
