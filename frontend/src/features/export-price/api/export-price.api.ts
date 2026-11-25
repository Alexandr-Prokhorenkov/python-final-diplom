import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class ExportPriceApi {
  private readonly http = inject(HttpClient);

  download() {
    return this.http.get(`${API_BASE}/partner/export`, { responseType: 'blob' });
  }
}
