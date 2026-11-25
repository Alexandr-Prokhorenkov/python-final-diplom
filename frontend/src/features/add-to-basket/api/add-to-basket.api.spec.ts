import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE } from '@shared/api';

import { AddToBasketApi } from './add-to-basket.api';

describe('AddToBasketApi', () => {
  it('posts product_info and quantity', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AddToBasketApi],
    });
    const api = TestBed.inject(AddToBasketApi);
    const http = TestBed.inject(HttpTestingController);

    api.add(15, 2).subscribe((body) => {
      expect(body.Status).toBeTrue();
    });

    const request = http.expectOne(`${API_BASE}/basket`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ product_info: 15, quantity: 2 });
    request.flush({ Status: true, 'Создано объектов': 1 });
    http.verify();
  });
});
