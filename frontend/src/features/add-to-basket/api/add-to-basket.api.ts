import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { API_BASE } from '@shared/api';

@Injectable({ providedIn: 'root' })
export class AddToBasketApi {
  private readonly http = inject(HttpClient);

  add(productInfoId: number, quantity: number) {
    return this.http.post<{ Status: boolean }>(`${API_BASE}/basket`, {
      product_info: productInfoId,
      quantity,
    });
  }
}
