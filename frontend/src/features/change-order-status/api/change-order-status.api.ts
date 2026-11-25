import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class ChangeOrderStatusApi {
  private readonly http = inject(HttpClient);

  update(orderId: number, state: string) {
    return this.http.patch<{ Status: boolean; id: number; state: string }>(
      `${API_BASE}/order/${orderId}/status`,
      { state },
    );
  }
}
