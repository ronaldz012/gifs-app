export type RevertBlockReason = 'ALREADY_REVERTED' | 'OUTDATED' | 'NOT_ENOUGH_STOCK' | '';

export interface StockReceptionRevertCheckDto {
  receptionId: GUID;
  canRevert: boolean;
  reason: RevertBlockReason;
}
