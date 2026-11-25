import { Component } from '@angular/core';
import { Message } from 'primeng/message';

import { PageHeader } from '@shared/ui';

@Component({
  selector: 'page-not-found',
  imports: [PageHeader, Message],
  template: `
    <section class="app-page">
      <ui-page-header title="Страница не найдена" />
      <p-message severity="info" text="Проверьте адрес или вернитесь в каталог." />
    </section>
  `,
})
export class NotFoundPage {}
