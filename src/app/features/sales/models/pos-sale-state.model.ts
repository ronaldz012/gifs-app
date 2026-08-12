import { PaymentMethod } from '../models/payment-method';

export interface PosCartItem {
  productVariantId: GUID;
  quantity: number;
  productName: string;
  categoryName: string;
  brandName: string;
  sku: string;
  size: string;
  colorName: string;
  stock: number;
  originalPrice: number;
  sellingPrice: number;
  discountAmount: number;
}

export interface PosSaleState {
  paymentMethod: PaymentMethod | null;
  transactionCode: string | null;
  publicName: string | null;
  cashReceived: number;

  items: PosCartItem[];
}
