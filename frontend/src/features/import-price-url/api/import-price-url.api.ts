import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class ImportPriceUrlApi {
  private readonly http = inject(HttpClient);

  importFromUrl(url: string) {
    return this.http.post<{ Status: boolean; created?: number; updated?: number }>(
      `${API_BASE}/partner/update`,
      { url },
    );
  }
}
