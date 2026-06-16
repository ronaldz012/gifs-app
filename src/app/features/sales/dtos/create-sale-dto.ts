import { PaymentMethod } from "../models/payment-method";

export interface CreateSaleDto {
    transcationCode: string | null;
    paymentMethod: PaymentMethod;
    public: string | null;
    items : CreateSaleItemDto[];


}
export interface CreateSaleItemDto
{
    productVariantId: GUID;
    quantity: number;
    discountAmount: number;
}
