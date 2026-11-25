import { Component } from '@angular/core';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'ui-toast-host',
  imports: [Toast],
  template: `<p-toast position="top-right" />`,
})
export class ToastHost {}
