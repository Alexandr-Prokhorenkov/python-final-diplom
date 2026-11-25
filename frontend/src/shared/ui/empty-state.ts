import { Component, input } from '@angular/core';
import { Message } from 'primeng/message';

@Component({
  selector: 'ui-empty-state',
  imports: [Message],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.scss',
})
export class EmptyState {
  readonly text = input('Ничего не найдено');
}
