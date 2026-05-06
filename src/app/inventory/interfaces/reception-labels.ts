import {Gender} from './gender';

export const GenderLabel: Record<Gender, string> = {
  [Gender.Unixes]: 'Unisex',
  [Gender.Hombre]: 'Masc.',
  [Gender.Mujer]: 'Fem.',
};

// ─── DTOs (espejo del backend) ───────────────────────────────────────────────

export interface ReceptionLabelItemDto {
  variantId: number;
  sku: string;
  size: string;
  color: string;
  gender: Gender;
  price: number;
  productName: string;
  brandName: string;
  categoryName: string;
  quantity: number; // cuántas etiquetas imprimir de esta variante
}

export interface ReceptionLabelsDto {
  receptionId: number;
  receptionDate: string; // ISO date string
  items: ReceptionLabelItemDto[];
}

// ─── Modelo interno (una etiqueta ya expandida) ───────────────────────────────

export interface LabelData {
  variantId: number;
  sku: string;
  productName: string;
  brandName: string;
  size: string;
  color: string;
  gender: Gender;
  price: number;
  receptionId: number;
}

export const LABELS_PER_SHEET = 27; // 3 columnas × 6 filas en A4
