import { MovementType } from "@features/inventory/interfaces/movement-type";
import { BaseQueryDto } from "../base-query-dto";

export interface ListStockMovementDto {
  id: string;

  createdAt: string;

  movementType: MovementType;

  quantity: number;

  userName: string;

  branchName: string;

  notes: string;

  transferToBranchName: string | null;

  referenceId: string | null;
}

export interface StockMovementParams extends BaseQueryDto
{
    
}