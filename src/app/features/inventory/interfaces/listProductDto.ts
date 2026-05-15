export interface ListProductDto {
  id:            GUID;
  name:          string;
  internalCode:  string;
  categoryName:  string;
  brandName:     string;
  variantsCount: number;
  totalStock:    number;
  displayPrice:  number;

}
