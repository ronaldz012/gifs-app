export interface CreateMovementDto {
  amount: number;
  description: string;
  type: 'Outflow' | 'Inflow';
}
