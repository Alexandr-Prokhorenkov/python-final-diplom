import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class ConfirmApi {
  private readonly http = inject(HttpClient);

  confirm(email: string, token: string) {
    return this.http.post<{ Status: boolean }>(`${API_BASE}/user/register/confirm`, {
      email,
      token,
    });
  }
}
