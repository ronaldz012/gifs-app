export enum BranchType {
  Warehouse = 0,
  PointOfSale = 1,
}

export const BRANCH_TYPE_LABELS: Record<BranchType, string> = {
  [BranchType.Warehouse]: 'Almacén',
  [BranchType.PointOfSale]: 'Punto de venta',
};

export interface CreateBranchRequest {
  name: string;
  place: string;
  phoneNumber: string;
  type?: BranchType;
}
