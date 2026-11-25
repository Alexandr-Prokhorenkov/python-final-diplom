import { Contact } from '@entities/contact';
import { ProductInfo } from '@entities/product-info';

export interface OrderItem {
  id: number;
  product_info: ProductInfo;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  ordered_items: OrderItem[];
  state: string;
  dt: string;
  total_sum: number;
  contact: Contact | null;
}
