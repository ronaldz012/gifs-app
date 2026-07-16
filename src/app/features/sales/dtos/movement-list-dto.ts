export interface MovementListDto {
  id: GUID;
  cashRegisterClosureId: GUID;
  amount: number;
  description: string;
  type: 'Outflow' | 'Inflow';
  createdAt: string;
}
