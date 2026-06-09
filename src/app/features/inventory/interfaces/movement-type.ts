export enum MovementType {
  Reception = 0,
  Sale = 1,
  Adjustment = 2,
  TransferOut = 3,
  TransferIn = 4,
}
export function movementTypeToSpanish(type: MovementType): string {
  switch (type) {
    case MovementType.Reception:
      return 'Recepción';

    case MovementType.Sale:
      return 'Venta';

    case MovementType.Adjustment:
      return 'Ajuste';

    case MovementType.TransferOut:
      return 'Transferencia de salida';

    case MovementType.TransferIn:
      return 'Transferencia de entrada';

    default:
      return 'Desconocido';
  }
}