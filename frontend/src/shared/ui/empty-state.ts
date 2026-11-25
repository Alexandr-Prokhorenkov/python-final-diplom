import { Component, input } from '@angular/core';
import { Message } from 'primeng/message';

@Component({
  selector: 'ui-empty-state',
  imports: [Message],
  template: `
    <p-message severity="info" [text]="text()" />
  `,
})
export class EmptyState {
  readonly text = input('Ничего не найдено');
}
