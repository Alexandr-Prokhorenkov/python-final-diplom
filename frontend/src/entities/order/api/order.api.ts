import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

import { Order } from '../model/types';

@Injectable({ providedIn: 'root' })
export class OrderApi {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<Order[]>(`${API_BASE}/order`);
  }

  detail(id: number) {
    return this.http.get<Order>(`${API_BASE}/order/${id}/`);
  }

  partnerList() {
    return this.http.get<Order[]>(`${API_BASE}/partner/orders`);
  }
}
