import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class PasswordResetApi {
  private readonly http = inject(HttpClient);

  request(email: string) {
    return this.http.post(`${API_BASE}/user/password_reset`, { email });
  }

  confirm(token: string, password: string) {
    return this.http.post(`${API_BASE}/user/password_reset/confirm`, { token, password });
  }
}
