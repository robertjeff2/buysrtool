// 产品相关类型定义
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  size_color: string;
  image: string;
  sizes: string[];
  colors: string[];
  description?: string;
  stock?: number;
  sales?: number;
  rating?: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface ProductFilter {
  category?: string;
  keyword?: string;
  priceRange?: [number, number];
  sortBy?: 'default' | 'price-asc' | 'price-desc' | 'sales' | 'rating' | 'newest';
  inStock?: boolean;
}

// 购物车状态
export interface CartState {
  items: CartItem[];
  total: number;
  count: number;
}

// API 响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}