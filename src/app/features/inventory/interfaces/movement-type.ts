export enum MovementType {
  Reception = 0,
  Sale = 1,
  Return = 2,
  Adjustment = 3,
  TransferOut = 4,
  TransferIn = 5,
  ReceptionRevert = 6,
}
export function movementTypeToSpanish(type: MovementType): string {
  switch (type) {
    case MovementType.Reception:
      return 'Recepción';

    case MovementType.Sale:
      return 'Venta';

    case MovementType.Return:
      return 'Devolución';

    case MovementType.Adjustment:
      return 'Ajuste';

    case MovementType.TransferOut:
      return 'Transferencia de salida';

    case MovementType.TransferIn:
      return 'Transferencia de entrada';

    case MovementType.ReceptionRevert:
      return 'Reversión de recepción';

    default:
      return 'Desconocido';
  }
}
