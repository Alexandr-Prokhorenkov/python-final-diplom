import { Component } from '@angular/core';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'ui-toast-host',
  imports: [Toast],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.scss',
})
export class ToastHost {}
