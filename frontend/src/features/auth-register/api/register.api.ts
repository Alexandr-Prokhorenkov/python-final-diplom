import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  company?: string;
  position?: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterApi {
  private readonly http = inject(HttpClient);

  register(payload: RegisterPayload) {
    return this.http.post<{ Status: boolean }>(`${API_BASE}/user/register`, payload);
  }
}
