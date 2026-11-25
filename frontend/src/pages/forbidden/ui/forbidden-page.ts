import { Component } from '@angular/core';
import { Message } from 'primeng/message';

import { PageHeader } from '@shared/ui';

@Component({
  selector: 'page-forbidden',
  imports: [PageHeader, Message],
  templateUrl: './forbidden-page.html',
  styleUrl: './forbidden-page.scss',
})
export class ForbiddenPage {}
