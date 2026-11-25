import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

import { ProductFilters, ProductInfo } from '../model/types';

@Injectable({ providedIn: 'root' })
export class ProductInfoApi {
  private readonly http = inject(HttpClient);

  list(filters: ProductFilters = {}) {
    let params = new HttpParams();
    if (filters.shop_id) {
      params = params.set('shop_id', String(filters.shop_id));
    }
    if (filters.category_id) {
      params = params.set('category_id', String(filters.category_id));
    }
    return this.http.get<ProductInfo[]>(`${API_BASE}/products`, { params });
  }

  detail(id: number) {
    return this.http.get<ProductInfo>(`${API_BASE}/products/${id}/`);
  }
}
