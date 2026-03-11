
// Define la entidad base
export interface Category {
  id: number;
  name: string;
}

// Define el DTO de consulta (Query)
export interface QueryCategoriesDto {
  isPaged: boolean;
  page?: number;
  pageSize?: number;
  filter?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  fieldValue?: string;
  fieldName?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
