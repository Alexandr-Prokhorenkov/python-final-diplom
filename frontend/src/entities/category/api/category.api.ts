import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

import { Category } from '../model/types';

@Injectable({ providedIn: 'root' })
export class CategoryApi {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<Category[]>(`${API_BASE}/categories`);
  }
}
