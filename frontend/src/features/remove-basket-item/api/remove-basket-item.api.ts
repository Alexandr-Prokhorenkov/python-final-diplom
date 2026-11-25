import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class RemoveBasketItemApi {
  private readonly http = inject(HttpClient);

  remove(id: number) {
    return this.http.delete<{ Status: boolean }>(`${API_BASE}/basket`, { body: { id } });
  }
}
