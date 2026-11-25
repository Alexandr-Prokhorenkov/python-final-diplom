import { Component } from '@angular/core';
import { Message } from 'primeng/message';

import { PageHeader } from '@shared/ui';

@Component({
  selector: 'page-not-found',
  imports: [PageHeader, Message],
  templateUrl: './not-found-page.html',
  styleUrl: './not-found-page.scss',
})
export class NotFoundPage {}
