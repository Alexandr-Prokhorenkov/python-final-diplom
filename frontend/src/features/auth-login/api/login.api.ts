import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class LoginApi {
  private readonly http = inject(HttpClient);

  login(email: string, password: string) {
    return this.http.post<{ Status: boolean; Token: string }>(`${API_BASE}/user/login`, {
      email,
      password,
    });
  }
}
