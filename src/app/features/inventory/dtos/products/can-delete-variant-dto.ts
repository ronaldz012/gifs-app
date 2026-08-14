export type VariantDeleteReason = 'HAS_MOVEMENTS' | 'HAS_TRANSFER';

export interface CanDeleteVariantResponse {
  variantId: GUID;
  canDelete: boolean;
  reason: VariantDeleteReason | '';
}
