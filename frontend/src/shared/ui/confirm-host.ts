import { Component } from '@angular/core';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'ui-confirm-host',
  imports: [ConfirmDialog],
  template: `<p-confirmdialog />`,
})
export class ConfirmHost {}
