import { MovementType } from "@features/inventory/interfaces/movement-type";
import { BaseQueryDto } from "../base-query-dto";

export interface ListStockMovementDto {
  id: string;

  createdAt: string;

  movementType: MovementType;

  quantity: number;

  userName: string;

  branchName: string;

  transferToBranchName: string | null;

  notes: string;

  stockTransferId: string | null;
}

export interface stockMovementParams extends BaseQueryDto
{

}