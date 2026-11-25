import { Component } from '@angular/core';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'ui-confirm-host',
  imports: [ConfirmDialog],
  templateUrl: './confirm-host.html',
  styleUrl: './confirm-host.scss',
})
export class ConfirmHost {}
