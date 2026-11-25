import { Component, inject, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { firstValueFrom } from 'rxjs';

import { Category, CategoryApi } from '@entities/category';
import { ProductFilters } from '@entities/product-info';
import { Shop, ShopApi } from '@entities/shop';

@Component({
  selector: 'widget-product-filters',
  imports: [FormsModule, Select, Button],
  templateUrl: './product-filters.html',
  styleUrl: './product-filters.scss',
})
export class ProductFiltersWidget implements OnInit {
  private readonly shopsApi = inject(ShopApi);
  private readonly categoriesApi = inject(CategoryApi);

  readonly changed = output<ProductFilters>();
  readonly shops = signal<Shop[]>([]);
  readonly categories = signal<Category[]>([]);
  shopId: number | null = null;
  categoryId: number | null = null;

  async ngOnInit(): Promise<void> {
    const [shops, categories] = await Promise.all([
      firstValueFrom(this.shopsApi.list()),
      firstValueFrom(this.categoriesApi.list()),
    ]);
    this.shops.set(shops);
    this.categories.set(categories);
  }

  apply(): void {
    this.changed.emit({
      shop_id: this.shopId,
      category_id: this.categoryId,
    });
  }
}
