export type CreateEntityEvent = {
  type: 'category' | 'brand' | 'color';
  query: string;
  itemIndex: number;
  subIndex?: number; // for color
};
