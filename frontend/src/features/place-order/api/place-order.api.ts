import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class PlaceOrderApi {
  private readonly http = inject(HttpClient);

  place(orderId: number, contactId: number) {
    return this.http.post<{ Status: boolean; id: number; state: string; total_sum: number }>(
      `${API_BASE}/order`,
      { id: orderId, contact: contactId },
    );
  }
}
