import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-page-header',
  template: `
    <header class="app-stack">
      <h1 style="margin:0;font-size:1.6rem">{{ title() }}</h1>
      @if (subtitle()) {
        <p style="margin:0;color:var(--p-text-muted-color, #64748b)">{{ subtitle() }}</p>
      }
    </header>
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
