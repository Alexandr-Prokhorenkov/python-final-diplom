import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

import { Contact } from '../model/types';

@Injectable({ providedIn: 'root' })
export class ContactApi {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<Contact[]>(`${API_BASE}/user/contact`);
  }
}
