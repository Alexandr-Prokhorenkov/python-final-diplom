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
  template: `
    <div class="app-toolbar">
      <label>
        Магазин
        <p-select
          [options]="shops()"
          optionLabel="name"
          optionValue="id"
          [(ngModel)]="shopId"
          placeholder="Все магазины"
          [showClear]="true"
          appendTo="body"
        />
      </label>
      <label>
        Категория
        <p-select
          [options]="categories()"
          optionLabel="name"
          optionValue="id"
          [(ngModel)]="categoryId"
          placeholder="Все категории"
          [showClear]="true"
          appendTo="body"
        />
      </label>
      <p-button label="Применить" (onClick)="apply()" />
    </div>
  `,
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
