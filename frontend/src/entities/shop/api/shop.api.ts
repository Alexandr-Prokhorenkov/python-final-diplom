import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

import { Shop } from '../model/types';

@Injectable({ providedIn: 'root' })
export class ShopApi {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<Shop[]>(`${API_BASE}/shops`);
  }

  partnerState() {
    return this.http.get<Shop>(`${API_BASE}/partner/state`);
  }
}
