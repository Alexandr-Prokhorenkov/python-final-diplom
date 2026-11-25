import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';
import { ContactPayload } from '@entities/contact';

@Injectable({ providedIn: 'root' })
export class SaveContactApi {
  private readonly http = inject(HttpClient);

  create(payload: ContactPayload) {
    return this.http.post<{ Status: boolean; id: number }>(`${API_BASE}/user/contact`, payload);
  }

  update(payload: ContactPayload) {
    return this.http.put<{ Status: boolean }>(`${API_BASE}/user/contact`, payload);
  }

  remove(id: number) {
    return this.http.delete<{ Status: boolean }>(`${API_BASE}/user/contact`, { body: { id } });
  }
}
