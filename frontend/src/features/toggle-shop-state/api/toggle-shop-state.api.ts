import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class ToggleShopStateApi {
  private readonly http = inject(HttpClient);

  set(state: boolean) {
    return this.http.post<{ Status: boolean; state: boolean }>(`${API_BASE}/partner/state`, {
      state,
    });
  }
}
