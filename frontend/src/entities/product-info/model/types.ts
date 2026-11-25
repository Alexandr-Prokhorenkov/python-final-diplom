export interface ProductRef {
  id: number;
  name: string;
  category: string;
}

export interface ShopRef {
  id: number;
  name: string;
  state: boolean;
}

export interface ProductParameter {
  parameter: string;
  value: string;
}

export interface ProductInfo {
  id: number;
  model: string;
  product: ProductRef;
  shop: ShopRef;
  quantity: number;
  price: number;
  price_rrc: number;
  product_parameters: ProductParameter[];
}

export interface ProductFilters {
  shop_id?: number | null;
  category_id?: number | null;
}
