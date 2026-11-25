import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

import { User, UserUpdatePayload } from '../model/types';

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly http = inject(HttpClient);

  details() {
    return this.http.get<User>(`${API_BASE}/user/details`);
  }

  update(payload: UserUpdatePayload) {
    return this.http.post<{ Status: boolean }>(`${API_BASE}/user/details`, payload);
  }
}
