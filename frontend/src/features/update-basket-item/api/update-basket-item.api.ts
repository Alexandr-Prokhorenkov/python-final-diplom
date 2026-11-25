import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class UpdateBasketItemApi {
  private readonly http = inject(HttpClient);

  update(id: number, quantity: number) {
    return this.http.put<{ Status: boolean }>(`${API_BASE}/basket`, { id, quantity });
  }
}
