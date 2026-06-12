import {Gender} from './gender';

export const GenderLabel: Record<Gender, string> = {
  [Gender.Unisex]: 'Unisex',
  [Gender.Hombre]: 'Masc.',
  [Gender.Mujer]: 'Fem.',
};

// Modelo interno (una etiqueta ya expandida)
export interface LabelData {
  variantId: GUID;
  sku: string;
  productName: string;
  brandName: string;
  size: string;
  color: string;
  gender: Gender;
  price: number;
  receptionId: GUID;
}

export const LABELS_PER_SHEET = 27; // 3 columnas × 6 filas en A4
