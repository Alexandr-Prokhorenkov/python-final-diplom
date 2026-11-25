import { Component } from '@angular/core';
import { Message } from 'primeng/message';

import { PageHeader } from '@shared/ui';

@Component({
  selector: 'page-forbidden',
  imports: [PageHeader, Message],
  template: `
    <section class="app-page">
      <ui-page-header title="Нет доступа" />
      <p-message severity="warn" text="Этот раздел предназначен для другой роли." />
    </section>
  `,
})
export class ForbiddenPage {}
