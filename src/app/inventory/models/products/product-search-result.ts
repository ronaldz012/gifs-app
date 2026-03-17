export interface ProductSearchResult {
  id: number;
  name: string;
  productVariants: ProductVariantOption[];
}
export interface ProductVariantOption {
  id: number;
  description: string;
  size: string;
  color: string;
  price: number;
}
